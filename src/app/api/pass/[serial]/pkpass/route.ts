import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateApplePass, getAppleWalletConfig } from "@/lib/apple-wallet";

export async function GET(
  req: NextRequest,
  { params }: { params: { serial: string } }
) {
  try {
    const { serial } = params;
    const urlLang = req.nextUrl.searchParams.get("lang");
    const format = req.nextUrl.searchParams.get("format");
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
        { error: "البطاقة غير موجودة" },
        { status: 404 }
      );
    }

    const { merchant } = customer;

    // Diagnostic JSON format for developers or debugging inspectors
    if (format === "json") {
      const isCashback = customer.loyaltyType === "CASHBACK";
      const config = getAppleWalletConfig();
      return NextResponse.json({
        mode: "smart_apple_pass",
        customerName: customer.name,
        merchantName: merchant.name,
        loyaltyType: customer.loyaltyType,
        passSerial: customer.passSerial,
        memberCode: customer.memberCode,
        passTypeIdentifier: process.env.APPLE_PASS_TYPE_ID || "pass.ma.walink.loyalty",
        teamIdentifier: process.env.APPLE_TEAM_ID || "ZNM6JZ2DD4",
        webServiceURL: config.webServiceUrl,
        isConfigured: config.isConfigured,
        signerCertLen: config.signerCert?.length || 0,
        signerKeyLen: config.signerKey?.length || 0,
        signerKeyHead: config.signerKey?.toString("utf8").slice(0, 30) || "",
        wwdrCertLen: config.wwdrCert?.length || 0,
        wwdrCertHead: config.wwdrCert?.toString("utf8").slice(0, 30) || "",
        stamps: customer.stamps,
        stampsRequired: merchant.stampsRequired,
        cashbackBalance: customer.cashbackBalance,
        cashbackRate: merchant.cashbackRate,
        isVip: customer.isVip,
        isCashback,
      });
    }

    // Generate signed .pkpass binary buffer
    const pkpassBuffer = await generateApplePass(customer, merchant, locale);

    const safeSlug = merchant.slug.replace(/[^a-zA-Z0-9_-]/g, "_");
    const filename = `${safeSlug}-loyalty-pass.pkpass`;

    return new NextResponse(new Uint8Array(pkpassBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.apple.pkpass",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error: unknown) {
    console.error("Error generating official Apple Wallet .pkpass:", error);
    const msg = error instanceof Error ? error.message : "تعذر توليد ملف المحفظة";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
