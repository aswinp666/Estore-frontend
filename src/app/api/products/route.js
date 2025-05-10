import { NextResponse } from 'next/server';
import { connectToDB } from '../../../lib/mongoose';
import Product from './../../../components/models/Product';
import { writeFile } from 'fs/promises';
import path from 'path';

// Helper function to set headers
const setHeaders = (response, status = 200) => {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
};

export async function POST(request) {
  try {
    await connectToDB();
    const formData = await request.formData();
    
    const productData = {
      name: formData.get('name'),
      description: formData.get('description'),
      price: formData.get('price'),
      category: formData.get('category'),
    };

    // Handle file upload
    const imageFile = formData.get('image');
    if (imageFile) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const filename = `${Date.now()}_${imageFile.name.replace(/\s+/g, '_')}`;
      const uploadDir = path.join(process.cwd(), 'public/uploads');
      
      try {
        await writeFile(path.join(uploadDir, filename), buffer);
        productData.imageUrl = `/uploads/${filename}`;
      } catch (uploadError) {
        console.error('File upload failed:', uploadError);
      }
    }

    const newProduct = new Product(productData);
    await newProduct.save();

    return setHeaders(NextResponse.json(
      { success: true, product: newProduct },
      { status: 201 }
    ));
  } catch (error) {
    return setHeaders(NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    ));
  }
}

export async function GET() {
  try {
    await connectToDB();
    const products = await Product.find({});
    return setHeaders(NextResponse.json(products));
  } catch (error) {
    return setHeaders(NextResponse.json(
      { error: 'Failed to fetch products', details: error.message },
      { status: 500 }
    ));
  }
}

export async function DELETE(request) {
  try {
    await connectToDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return setHeaders(NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      ));
    }

    const deletedProduct = await Product.findByIdAndDelete(id);
    
    if (!deletedProduct) {
      return setHeaders(NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      ));
    }

    return setHeaders(NextResponse.json(
      { success: true, message: 'Product deleted successfully' }
    ));
  } catch (error) {
    return setHeaders(NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    ));
  }
}