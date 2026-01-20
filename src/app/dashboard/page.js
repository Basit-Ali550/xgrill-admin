"use client";
import { Header } from "@/components/Header";
import { useOrders } from "@/hooks/useOrders";
import { useInventory } from "@/hooks/useInventory";
import { useProducts } from "@/hooks/useProducts";

export default function DashboardPage() {
  const { orders } = useOrders();
  const { lowStockItems } = useInventory();
  const { products } = useProducts();

  const stats = [
    {
      title: "Total Orders",
      value: orders?.length || 0,
      icon: "📋",
      color: "#60a5fa",
      bgColor: "rgba(59, 130, 246, 0.2)",
    },
    {
      title: "Pending Orders",
      value: orders?.filter((o) => o.status === "PENDING").length || 0,
      icon: "⏳",
      color: "#facc15",
      bgColor: "rgba(234, 179, 8, 0.2)",
    },
    {
      title: "Total Products",
      value: products?.length || 0,
      icon: "🍔",
      color: "#4ade80",
      bgColor: "rgba(34, 197, 94, 0.2)",
    },
    {
      title: "Low Stock Items",
      value: lowStockItems?.length || 0,
      icon: "⚠️",
      color: "#f87171",
      bgColor: "rgba(239, 68, 68, 0.2)",
    },
  ];

  const recentOrders = orders?.slice(0, 5) || [];

  const getStatusStyle = (status) => {
    const colors = {
      PENDING: { bg: 'rgba(234, 179, 8, 0.2)', color: '#facc15' },
      ACCEPTED: { bg: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' },
      PREPARING: { bg: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa' },
      OUT_FOR_DELIVERY: { bg: 'rgba(249, 115, 22, 0.2)', color: '#fb923c' },
      DELIVERED: { bg: 'rgba(34, 197, 94, 0.2)', color: '#4ade80' },
      CANCELLED: { bg: 'rgba(239, 68, 68, 0.2)', color: '#f87171' },
    };
    return colors[status] || { bg: 'rgba(107, 114, 128, 0.2)', color: '#9ca3af' };
  };

  return (
    <>
      <Header title="Dashboard" />
      
      <div style={{ padding: '24px' }}>
        {/* Stats Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '16px',
          marginBottom: '24px'
        }}>
          {stats.map((stat) => (
            <div key={stat.title} style={{
              background: 'rgba(31, 41, 55, 0.5)',
              borderRadius: '12px',
              border: '1px solid rgba(75, 85, 99, 0.5)',
              padding: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>{stat.title}</p>
                  <p style={{ fontSize: '32px', fontWeight: 'bold', color: stat.color, margin: '4px 0 0' }}>
                    {stat.value}
                  </p>
                </div>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  background: stat.bgColor, 
                  borderRadius: '12px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <span style={{ fontSize: '24px' }}>{stat.icon}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
          gap: '24px' 
        }}>
          {/* Recent Orders */}
          <div style={{
            background: 'rgba(31, 41, 55, 0.5)',
            borderRadius: '12px',
            border: '1px solid rgba(75, 85, 99, 0.5)',
            padding: '24px'
          }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: 'white', 
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>📋</span> Recent Orders
            </h3>
            
            {recentOrders.length === 0 ? (
              <p style={{ color: '#6b7280', textAlign: 'center', padding: '32px 0' }}>No orders yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentOrders.map((order) => {
                  const statusStyle = getStatusStyle(order.status);
                  return (
                    <div key={order.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px',
                      background: 'rgba(31, 41, 55, 0.5)',
                      borderRadius: '8px'
                    }}>
                      <div>
                        <p style={{ fontWeight: '500', color: 'white', margin: 0 }}>{order.orderNumber}</p>
                        <p style={{ fontSize: '14px', color: '#9ca3af', margin: '4px 0 0' }}>{order.user?.name}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ 
                          padding: '4px 10px', 
                          borderRadius: '12px', 
                          fontSize: '12px', 
                          fontWeight: '600',
                          background: statusStyle.bg,
                          color: statusStyle.color
                        }}>
                          {order.status}
                        </span>
                        <p style={{ fontSize: '14px', color: '#fb923c', marginTop: '4px' }}>
                          Rs. {order.totalAmount}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Low Stock Alerts */}
          <div style={{
            background: 'rgba(31, 41, 55, 0.5)',
            borderRadius: '12px',
            border: '1px solid rgba(75, 85, 99, 0.5)',
            padding: '24px'
          }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: 'white', 
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>⚠️</span> Low Stock Alerts
            </h3>
            
            {lowStockItems.length === 0 ? (
              <p style={{ color: '#6b7280', textAlign: 'center', padding: '32px 0' }}>All items well stocked</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {lowStockItems.map((item) => (
                  <div key={item.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '8px'
                  }}>
                    <div>
                      <p style={{ fontWeight: '500', color: 'white', margin: 0 }}>{item.product?.name}</p>
                      <p style={{ fontSize: '14px', color: '#9ca3af', margin: '4px 0 0' }}>{item.product?.category}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#f87171', margin: 0 }}>{item.quantity}</p>
                      <p style={{ fontSize: '12px', color: '#6b7280' }}>Threshold: {item.lowStockThreshold}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
