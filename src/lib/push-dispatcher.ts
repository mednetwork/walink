import {
  pushGoogleWalletUpdate,
  type CustomerPassModel,
  type MerchantPassModel,
} from "@/lib/google-wallet";
import { sendApplePassUpdate } from "@/lib/apple-wallet";
import { sendWebPushToCustomer } from "@/lib/web-push";
import { getPassUrl } from "@/lib/urls";
import { runWithBoundedConcurrency } from "@/lib/utils";

export interface PushDispatchCustomer extends CustomerPassModel {
  applePushToken?: string | null;
  pushSubscription?: string | null;
}

export interface UnifiedPushJob {
  customer: PushDispatchCustomer;
  merchant: MerchantPassModel;
  title: string;
  body: string;
  tag?: string;
  locale?: string;
}

/**
 * Dispatches real-time lock-screen alerts across Google Wallet, Apple Wallet APNs,
 * and cryptographic Web Push (Service Worker) strictly post-commit.
 */
export async function dispatchCustomerLockScreenPush(
  job: UnifiedPushJob
): Promise<void> {
  const { customer, merchant, title, body, tag, locale = "ar" } = job;
  const tasks: Array<Promise<unknown>> = [
    pushGoogleWalletUpdate(customer, merchant, title, body, locale),
  ];

  if (customer.applePushToken) {
    tasks.push(sendApplePassUpdate(customer.applePushToken));
  }

  if (customer.pushSubscription) {
    tasks.push(
      sendWebPushToCustomer({
        customerId: customer.id,
        pushSubscription: customer.pushSubscription,
        title,
        body,
        url: getPassUrl(customer.passSerial),
        tag,
      })
    );
  }

  await Promise.allSettled(tasks);
}

/**
 * Dispatches multi-channel lock-screen notifications in bounded concurrent chunks.
 */
export async function dispatchBatchLockScreenPushes(
  jobs: UnifiedPushJob[],
  concurrency: number = 10
): Promise<void> {
  if (jobs.length === 0) return;
  await runWithBoundedConcurrency(jobs, concurrency, async (job) => {
    await dispatchCustomerLockScreenPush(job);
  });
}
