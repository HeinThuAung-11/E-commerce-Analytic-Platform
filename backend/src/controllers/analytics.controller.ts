import type { Request, Response } from "express";

import type { RevenueRange } from "../types/analytics";
import {
  getOrders,
  getOverview,
  getProducts,
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
  _request: Request,
  response: Response,
): Promise<void> {
  const data = await getTopProducts();

  response.status(200).json({
    success: true,
    data,
  });
}

export async function getOrdersHandler(request: Request, response: Response): Promise<void> {
  const page = Number(request.query.page ?? 1);
  const limit = Number(request.query.limit ?? 20);
  const data = await getOrders({ page, limit });

  response.status(200).json({
    success: true,
    data,
  });
}

export async function getProductsHandler(_request: Request, response: Response): Promise<void> {
  const data = await getProducts();

  response.status(200).json({
    success: true,
    data,
  });
}
