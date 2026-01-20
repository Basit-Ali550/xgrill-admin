"use client";
import { Header } from "@/components/Header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useProducts";

export default function ProductsPage() {
  const { products, loading, deleteProduct } = useProducts();

  const handleDelete = async (id, name) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteProduct(id);
      } catch (error) {
        console.error("Failed to delete product:", error);
      }
    }
  };

  return (
    <>
      <Header title="Products" />
      
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span>🍔</span> All Products
              </span>
              <Badge variant="default">{products?.length || 0} products</Badge>
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : products?.length === 0 ? (
              <p className="text-gray-500 text-center py-12">No products yet</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden hover:border-gray-600 transition-all"
                  >
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-40 object-cover"
                      />
                    )}
                    
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-white">{product.name}</h3>
                          <p className="text-sm text-gray-400">{product.category}</p>
                        </div>
                        <Badge variant={product.isActive ? "success" : "secondary"}>
                          {product.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                        {product.description || "No description"}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-orange-400">
                          Rs. {product.price}
                        </span>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">
                            Stock: {product.inventory?.quantity || 0}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(product.id, product.name)}
                            className="text-red-400 hover:text-red-300"
                          >
                            🗑️
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
