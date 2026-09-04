import { Request, Response } from 'express';
import { ProductService } from './product.service';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { getMultipleFilesPath } from '../../../shared/getFilePath';
import catchAsync from '../../../shared/catchAsync';

const createProduct = catchAsync(async (req: Request, res: Response) => {
  const data = { ...req.body };
  const images = getMultipleFilesPath(req.files, 'images');

  if (images && images.length > 0) {
    data.images = images;
  }

  const result = await ProductService.createProductToDB(data);
  return sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Product created successfully!',
    data: result,
  });
});

const getAllProducts = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.getAllProductsFromDB(req.user, req.query);
  return sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Products retrieved successfully!',
    data: result.result,
    pagination: result.pagination,
  });
});

const getSingleProduct = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.getSingleProductFromDB(
    req.user,
    req.params.id,
  );
  return sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Product retrieved successfully!',
    data: result,
  });
});

const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const data = { ...req.body };
  const uploadedImages = getMultipleFilesPath(req.files, 'images');

  // Handle images: if new files were uploaded, include them
  if (uploadedImages && uploadedImages.length > 0) {
    // If existing images list is passed in body as array or string, merge or replace
    const existingImages = Array.isArray(data.images)
      ? data.images
      : typeof data.images === 'string'
        ? [data.images]
        : [];

    data.images = [...existingImages, ...uploadedImages];
  }

  const result = await ProductService.updateProductToDB(req.params.id, data);
  return sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Product updated successfully!',
    data: result,
  });
});

const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.deleteProductFromDB(req.params.id);
  return sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Product deleted successfully!',
    data: result,
  });
});

const updateProductStatus = catchAsync(async (req: Request, res: Response) => {
  const { status } = req.body;
  const result = await ProductService.updateProductStatusToDB(
    req.params.id,
    status,
  );
  return sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Product status updated successfully!',
    data: result,
  });
});

const toggleProductFeatured = catchAsync(
  async (req: Request, res: Response) => {
    const result = await ProductService.toggleProductFeaturedToDB(
      req.params.id,
    );
    return sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Product featured status toggled successfully!',
      data: result,
    });
  },
);

const updateProductVariantStock = catchAsync(
  async (req: Request, res: Response) => {
    const { size, color, stock } = req.body;
    const result = await ProductService.updateProductVariantStockToDB(
      req.params.id,
      size,
      color,
      Number(stock),
    );
    return sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Product variant stock updated successfully!',
      data: result,
    });
  },
);

const increaseProductVariantStock = catchAsync(
  async (req: Request, res: Response) => {
    const { size, color, quantity } = req.body;
    const result = await ProductService.increaseProductVariantStockToDB(
      req.params.id,
      size,
      color,
      Number(quantity),
    );
    return sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Product variant stock increased successfully!',
      data: result,
    });
  },
);

const updateVariantPreOrder = catchAsync(
  async (req: Request, res: Response) => {
    const { size, color, isPreOrder, expectedAvailableDate } = req.body;
    const result = await ProductService.updateVariantPreOrderToDB(
      req.params.id,
      size,
      color,
      isPreOrder,
      expectedAvailableDate,
    );
    return sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Variant pre-order settings updated successfully!',
      data: result,
    });
  },
);

const checkProductVariantAvailability = catchAsync(
  async (req: Request, res: Response) => {
    const { size, color, quantity } = req.query;
    const result = await ProductService.checkProductVariantAvailability(
      req.params.id,
      String(size || ''),
      String(color || ''),
      Number(quantity || 1),
    );
    return sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Variant availability checked successfully!',
      data: result,
    });
  },
);

const getProductStats = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.getProductStatsFromDB();
  return sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Product analytics and stats retrieved successfully!',
    data: result,
  });
});

export const ProductController = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  updateProductStatus,
  toggleProductFeatured,
  updateProductVariantStock,
  increaseProductVariantStock,
  updateVariantPreOrder,
  checkProductVariantAvailability,
  getProductStats,
};
