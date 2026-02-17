import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const verdict = searchParams.get("verdict") || "";
    const search = searchParams.get("search") || "";

    const where: any = {};
    if (verdict) where.verdict = verdict;
    if (search)
      where.contractAddress = { contains: search, mode: "insensitive" };

    const [scans, total] = await Promise.all([
      prisma.scan.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: { user: { select: { email: true } } },
      }),
      prisma.scan.count({ where }),
    ]);

    return NextResponse.json({
      scans,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Admin scans error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser || authUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    const { scanId } = (await request.json()) as { scanId: string };
    if (!scanId) {
      return NextResponse.json({ error: "scanId required" }, { status: 400 });
    }

    // Cascade delete: remove related reports first, then the scan
    await prisma.$transaction([
      prisma.report.deleteMany({ where: { scanId } }),
      prisma.scan.delete({ where: { id: scanId } }),
    ]);

    await prisma.auditLog.create({
      data: {
        userId: authUser.userId as string,
        action: "DELETE_SCAN",
        details: { scanId },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin delete scan error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
