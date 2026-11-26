import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  generateGoogleWalletSaveUrl,
  syncGoogleWalletPassOnSave,
} from "@/lib/google-wallet";

export async function GET(
  req: NextRequest,
  { params }: { params: { serial: string } }
) {
  try {
    const { serial } = params;
    const urlLang = req.nextUrl.searchParams.get("lang");
    const shouldActivate = req.nextUrl.searchParams.get("activate") === "1";
    const acceptLang = req.headers.get("accept-language") || "";

    let locale = "ar";
    if (urlLang === "fr" || (!urlLang && acceptLang.toLowerCase().includes("fr"))) {
      locale = "fr";
    } else if (urlLang === "es" || (!urlLang && acceptLang.toLowerCase().includes("es"))) {
      locale = "es";
    } else if (urlLang === "ar") {
      locale = "ar";
    }

    const customer = await prisma.customer.findUnique({
      where: { passSerial: serial },
      include: {
        merchant: true,
      },
    });

    if (!customer) {
      return NextResponse.json(
        { ok: false, error: "البطاقة غير موجودة" },
        { status: 404 }
      );
    }

    const { merchant } = customer;
    const origin = req.nextUrl.origin || "https://walink.ma";

    // Track that the customer activated/requested Google Wallet
    if (shouldActivate && customer.walletType !== "GOOGLE") {
      await prisma.customer.update({
        where: { id: customer.id },
        data: { walletType: "GOOGLE" },
      });
    }

    // Also sync existing saved Google Wallet class/object immediately so visual heroImage updates without waiting
    if (customer.walletType === "GOOGLE" || shouldActivate) {
      await syncGoogleWalletPassOnSave(customer, merchant, locale).catch((err) =>
        console.warn("[GoogleWalletRoute] Non-blocking sync warning:", err)
      );
    }

    const result = generateGoogleWalletSaveUrl(
      customer,
      merchant,
      locale,
      origin
    );

    return NextResponse.json({
      ok: true,
      passSerial: customer.passSerial,
      memberCode: customer.memberCode,
      merchantName: merchant.name,
      configured: result.configured,
      mode: result.mode,
      saveUrl: result.saveUrl,
      previewPayload: result.previewPayload,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "تعذر توليد رابط محفظة Google";
    console.error("[GoogleWalletRoute] GET error:", error);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
