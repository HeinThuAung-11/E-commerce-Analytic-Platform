import type { Request, Response } from "express";

import type { RevenueRange } from "../types/analytics";
import {
  getCategoryDistribution,
  getOrderStatusMix,
  getOrderTrend,
  getOrders,
  getOverview,
  getPaginatedProducts,
  getRevenueByStatus,
  getRevenue,
  getTopProducts,
} from "../services/analytics.service";

export async function getOverviewHandler(_request: Request, response: Response): Promise<void> {
  const data = await getOverview();

  response.status(200).json({
    success: true,
    data,
  });
}

export async function getRevenueHandler(request: Request, response: Response): Promise<void> {
  const range = request.query.range as RevenueRange;
  const data = await getRevenue(range);

  response.status(200).json({
    success: true,
    data,
  });
}

export async function getTopProductsHandler(
  request: Request,
  response: Response,
): Promise<void> {
  const range = (request.query.range as RevenueRange | undefined) ?? "30d";
  const data = await getTopProducts(range);

  response.status(200).json({
    success: true,
    data,
  });
}

export async function getOrderTrendHandler(request: Request, response: Response): Promise<void> {
  const range = request.query.range as RevenueRange;
  const data = await getOrderTrend(range);

  response.status(200).json({
    success: true,
    data,
  });
}

export async function getRevenueByStatusHandler(
  request: Request,
  response: Response,
): Promise<void> {
  const range = request.query.range as RevenueRange;
  const data = await getRevenueByStatus(range);

  response.status(200).json({
    success: true,
    data,
  });
}

export async function getCategoryDistributionHandler(
  request: Request,
  response: Response,
): Promise<void> {
  const range = (request.query.range as RevenueRange | undefined) ?? "30d";
  const data = await getCategoryDistribution(range);

  response.status(200).json({
    success: true,
    data,
  });
}

export async function getOrderStatusMixHandler(
  request: Request,
  response: Response,
): Promise<void> {
  const range = (request.query.range as RevenueRange | undefined) ?? "30d";
  const data = await getOrderStatusMix(range);

  response.status(200).json({
    success: true,
    data,
  });
}

export async function getOrdersHandler(request: Request, response: Response): Promise<void> {
  const page = Number(request.query.page ?? 1);
  const limit = Number(request.query.limit ?? 20);
  const range = request.query.range as RevenueRange | undefined;
  const data = await getOrders({ page, limit, range });

  response.status(200).json({
    success: true,
    data,
  });
}

export async function getProductsHandler(request: Request, response: Response): Promise<void> {
  const page = Number(request.query.page ?? 1);
  const limit = Number(request.query.limit ?? 20);
  const data = await getPaginatedProducts({ page, limit });

  response.status(200).json({
    success: true,
    data,
  });
}
