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

    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalScans,
      scansLast24h,
      scansLast7d,
      highRiskScans,
      verdictCounts,
      recentScans,
      recentScansForChart,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.scan.count(),
      prisma.scan.count({ where: { createdAt: { gte: last24Hours } } }),
      prisma.scan.count({ where: { createdAt: { gte: last7Days } } }),
      prisma.scan.count({
        where: {
          verdict: {
            in: ["HIGH RISK — HONEYPOT", "RUGPULL LIKELY", "KNOWN SCAM"],
          },
        },
      }),
      prisma.scan.groupBy({
        by: ["verdict"],
        _count: true,
        where: { verdict: { not: null } },
      }),
      prisma.scan.findMany({
        where: {
          verdict: {
            in: ["HIGH RISK — HONEYPOT", "RUGPULL LIKELY", "KNOWN SCAM"],
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { user: { select: { email: true } } },
      }),
      prisma.scan.findMany({
        where: { createdAt: { gte: last30Days } },
        select: { createdAt: true },
      }),
    ]);

    const dailyScans: Record<string, number> = {};
    const dayLabels: string[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split("T")[0];
      dayLabels.push(key);
      dailyScans[key] = 0;
    }
    recentScansForChart.forEach((s: any) => {
      const key = new Date(s.createdAt).toISOString().split("T")[0];
      if (dailyScans[key] !== undefined) dailyScans[key]++;
    });

    return NextResponse.json({
      stats: {
        totalUsers,
        totalScans,
        scansLast24h,
        scansLast7d,
        highRiskScans,
      },
      verdictCounts: verdictCounts.map((v: any) => ({
        verdict: v.verdict,
        count: v._count,
      })),
      recentHighRisk: recentScans,
      chartData: dayLabels.map((day) => ({
        date: day,
        scans: dailyScans[day],
      })),
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
