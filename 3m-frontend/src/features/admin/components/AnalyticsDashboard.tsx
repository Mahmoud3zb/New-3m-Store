import { useState, useEffect } from 'react';
import { orderService } from '../../../services/orderService';
import type { IAnalyticsData } from '../../../services/orderService';
import { useLanguageStore } from '../../../store/languageStore';
import { 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  ArrowUpRight, 
  Download, 
  Loader2, 
  MapPin, 
  Clock, 
  AlertCircle,
  BarChart3
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export function AnalyticsDashboard() {
  const { language } = useLanguageStore();
  const isRTL = language === 'ar';

  const [data, setData] = useState<IAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const res = await orderService.getAnalytics();
        setData(res);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
        toast.error(isRTL ? 'فشل تحميل بيانات الإحصائيات' : 'Failed to load analytics data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, [isRTL]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(isRTL ? 'ar-EG' : 'en-US', {
      style: 'currency',
      currency: 'EGP',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(isRTL ? 'ar-EG' : 'en-US').format(num);
  };

  
  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      const orders = await orderService.getAllOrders();
      
      if (!orders || orders.length === 0) {
        toast.error(isRTL ? 'لا توجد طلبات لتصديرها' : 'No orders available to export');
        setIsExporting(false);
        return;
      }

      const headers = isRTL 
        ? ["رقم الطلب", "التاريخ", "العميل", "البريد الإلكتروني", "الهاتف", "المحافظة", "العنوان", "طريقة الدفع", "الحالة", "الإجمالي (ج.م)"]
        : ["Order ID", "Date", "Customer", "Email", "Phone", "City", "Street", "Payment Method", "Status", "Total Price (EGP)"];

      const csvRows = [headers.join(",")];

      orders.forEach(order => {
        const row = [
          `"${order._id}"`,
          `"${new Date(order.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}"`,
          `"${(order.userID?.name || 'غير معروف').replace(/"/g, '""')}"`,
          `"${(order.userID?.email || 'N/A').replace(/"/g, '""')}"`,
          `"${order.shippingAddress?.phone || 'N/A'}"`,
          `"${(order.shippingAddress?.city || 'N/A').replace(/"/g, '""')}"`,
          `"${(order.shippingAddress?.street || 'N/A').replace(/"/g, '""')}"`,
          `"${order.paymentMethod === 'cash' ? (isRTL ? 'دفع عند الاستلام' : 'COD') : (isRTL ? 'بطاقة ائتمان' : 'Card')}"`,
          `"${order.status}"`,
          order.totalPrice
        ];
        csvRows.push(row.join(","));
      });

      const csvContent = "\uFEFF" + csvRows.join("\n"); 
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `3M_Store_Orders_Report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(isRTL ? 'تم تصدير التقرير بنجاح!' : 'Report exported successfully!');
    } catch (err) {
      console.error('Failed to export orders:', err);
      toast.error(isRTL ? 'فشل تصدير البيانات' : 'Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-800" />
        <p className="text-xs text-neutral-400 font-bold">
          {isRTL ? 'جاري تحميل لوحة الإحصائيات...' : 'Loading analytics dashboard...'}
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-neutral-400 space-y-3">
        <AlertCircle className="w-8 h-8 text-neutral-300" />
        <p className="text-xs font-bold">
          {isRTL ? 'عذراً، فشل تحميل الإحصائيات حالياً.' : 'Failed to load analytics.'}
        </p>
      </div>
    );
  }

  const { kpis, statusDistribution, trend, bestSellers, governorates } = data;

  
  const chartWidth = 600;
  const chartHeight = 220;
  const paddingX = 45;
  const paddingY = 25;

  const maxRevenue = Math.max(...trend.map(t => t.revenue), 100);
  const chartPoints = trend.map((item, index) => {
    const x = paddingX + (index / (trend.length - 1)) * (chartWidth - 2 * paddingX);
    const y = chartHeight - paddingY - (item.revenue / maxRevenue) * (chartHeight - 2 * paddingY);
    return { x, y, ...item };
  });

  const linePath = chartPoints.reduce((acc, point, index) => {
    return index === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`;
  }, '');

  const areaPath = chartPoints.length > 0 
    ? `${linePath} L ${chartPoints[chartPoints.length - 1].x} ${chartHeight - paddingY} L ${chartPoints[0].x} ${chartHeight - paddingY} Z`
    : '';

  const hoveredPoint = hoveredIndex !== null ? chartPoints[hoveredIndex] : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
    
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-black text-neutral-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            {isRTL ? 'لوحة المبيعات والتقارير' : 'Sales Analytics & Reports'}
          </h2>
          <p className="text-xs text-neutral-400">
            {isRTL ? 'تحليل المبيعات، ومراقبة الأداء وتصدير الفواتير' : 'Monitor revenue, best sellers and export orders'}
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={isExporting}
          className="flex items-center gap-2 bg-black hover:bg-neutral-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer disabled:bg-neutral-200 disabled:text-neutral-400"
        >
          {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {isRTL ? 'تصدير الطلبات كـ CSV' : 'Export Orders to CSV'}
        </button>
      </div>

     
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        
        <div className="bg-white border border-neutral-100 rounded-3xl p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-2">
            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">
              {isRTL ? 'إجمالي الإيرادات' : 'Total Revenue'}
            </span>
            <h3 className="text-xl font-black text-neutral-900 font-serif-en">
              {formatCurrency(kpis.totalRevenue)}
            </h3>
            <span className="text-[10px] text-green-600 font-bold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>+12.4% {isRTL ? 'هذا الشهر' : 'this month'}</span>
            </span>
          </div>
          <div className="w-12 h-12 bg-neutral-50 rounded-2xl flex items-center justify-center border border-neutral-100/50">
            <DollarSign className="w-6 h-6 text-neutral-800" />
          </div>
        </div>

      
        <div className="bg-white border border-neutral-100 rounded-3xl p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-2">
            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">
              {isRTL ? 'إجمالي الطلبات' : 'Total Orders'}
            </span>
            <h3 className="text-xl font-black text-neutral-900 font-serif-en">
              {formatNumber(kpis.totalOrders)}
            </h3>
            <span className="text-[10px] text-neutral-400 font-bold">
              {isRTL ? 'طلب شراء مكتمل ومباشر' : 'Completed and direct orders'}
            </span>
          </div>
          <div className="w-12 h-12 bg-neutral-50 rounded-2xl flex items-center justify-center border border-neutral-100/50">
            <ShoppingBag className="w-6 h-6 text-neutral-800" />
          </div>
        </div>

      
        <div className="bg-white border border-neutral-100 rounded-3xl p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-2">
            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">
              {isRTL ? 'متوسط قيمة الطلب' : 'Average Order Value'}
            </span>
            <h3 className="text-xl font-black text-neutral-900 font-serif-en">
              {formatCurrency(kpis.avgOrderValue)}
            </h3>
            <span className="text-[10px] text-neutral-400 font-bold">
              {isRTL ? 'متوسط سلة المشتريات' : 'Average shopping basket value'}
            </span>
          </div>
          <div className="w-12 h-12 bg-neutral-50 rounded-2xl flex items-center justify-center border border-neutral-100/50">
            <ArrowUpRight className="w-6 h-6 text-neutral-800" />
          </div>
        </div>
      </div>

      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        
        <div className="lg:col-span-2 bg-white border border-neutral-100 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">
                {isRTL ? 'منحنى الإيرادات اليومية' : 'Daily Sales Trend'}
              </h3>
              <p className="text-[10px] text-neutral-400">
                {isRTL ? 'آخر ٣٠ يوماً من نشاط المتجر' : 'Last 30 days of storefront activity'}
              </p>
            </div>
            
            {hoveredPoint && (
              <div className="text-right text-[10px] bg-neutral-50 border border-neutral-100 px-3 py-1 rounded-lg">
                <span className="font-bold text-neutral-800">{hoveredPoint.date}: </span>
                <span className="font-bold text-black font-serif-en">{formatCurrency(hoveredPoint.revenue)}</span>
              </div>
            )}
          </div>

        
          <div className="relative w-full overflow-hidden">
            <svg 
              viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
              className="w-full h-auto overflow-visible select-none"
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <defs>
                <linearGradient id="chartAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#111111" stopOpacity="0.10" />
                  <stop offset="100%" stopColor="#111111" stopOpacity="0.00" />
                </linearGradient>
              </defs>

            
              {[0, 0.33, 0.66, 1].map((ratio, index) => {
                const y = paddingY + ratio * (chartHeight - 2 * paddingY);
                const value = Math.round(maxRevenue * (1 - ratio));
                return (
                  <g key={index} className="opacity-40">
                    <line 
                      x1={paddingX} 
                      y1={y} 
                      x2={chartWidth - paddingX} 
                      y2={y} 
                      stroke="#f3f4f6" 
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                    />
                    <text 
                      x={isRTL ? chartWidth - 5 : 5} 
                      y={y + 3} 
                      textAnchor={isRTL ? "end" : "start"} 
                      className="fill-neutral-400 text-[8px] font-bold font-serif-en"
                    >
                      {value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}
                    </text>
                  </g>
                );
              })}

            
              {areaPath && (
                <path d={areaPath} fill="url(#chartAreaGradient)" className="transition-all duration-300" />
              )}

            
              {linePath && (
                <path 
                  d={linePath} 
                  fill="none" 
                  stroke="#171717" 
                  strokeWidth={2.5} 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="transition-all duration-300"
                />
              )}

            
              {hoveredPoint && (
                <line 
                  x1={hoveredPoint.x} 
                  y1={paddingY} 
                  x2={hoveredPoint.x} 
                  y2={chartHeight - paddingY} 
                  stroke="#e5e5e5" 
                  strokeWidth={1.5} 
                  strokeDasharray="4 4"
                />
              )}

            
              {hoveredPoint && (
                <circle 
                  cx={hoveredPoint.x} 
                  cy={hoveredPoint.y} 
                  r={5} 
                  className="fill-black stroke-white stroke-2" 
                />
              )}

            
              {chartPoints.map((point, index) => {
                const colWidth = (chartWidth - 2 * paddingX) / (trend.length - 1);
                const rectX = point.x - colWidth / 2;
                return (
                  <rect
                    key={index}
                    x={rectX}
                    y={paddingY}
                    width={colWidth}
                    height={chartHeight - 2 * paddingY}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(index)}
                  />
                );
              })}

            
              {chartPoints.map((point, index) => {
                if (index % 5 !== 0 && index !== chartPoints.length - 1) return null;
                const formattedDate = point.date.substring(5); 
                return (
                  <text
                    key={index}
                    x={point.x}
                    y={chartHeight - 5}
                    textAnchor="middle"
                    className="fill-neutral-400 text-[8px] font-bold font-serif-en"
                  >
                    {formattedDate}
                  </text>
                );
              })}
            </svg>
          </div>
        </div>

        
        <div className="bg-white border border-neutral-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-6">
          
          
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-neutral-500" />
              {isRTL ? 'حالة الطلبات' : 'Order Statuses'}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              
              <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-3 text-center">
                <span className="text-[9px] font-bold text-amber-600 block">{isRTL ? 'معلق' : 'Pending'}</span>
                <span className="text-sm font-black text-neutral-800 font-serif-en">{formatNumber(statusDistribution.pending)}</span>
              </div>

              <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-3 text-center">
                <span className="text-[9px] font-bold text-blue-600 block">{isRTL ? 'قيد التجهيز' : 'Processing'}</span>
                <span className="text-sm font-black text-neutral-800 font-serif-en">{formatNumber(statusDistribution.processing)}</span>
              </div>

              <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-3 text-center">
                <span className="text-[9px] font-bold text-indigo-600 block">{isRTL ? 'تم الشحن' : 'Shipped'}</span>
                <span className="text-sm font-black text-neutral-800 font-serif-en">{formatNumber(statusDistribution.shipped)}</span>
              </div>

              <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-3 text-center">
                <span className="text-[9px] font-bold text-green-600 block">{isRTL ? 'تم التوصيل' : 'Delivered'}</span>
                <span className="text-sm font-black text-neutral-800 font-serif-en">{formatNumber(statusDistribution.delivered)}</span>
              </div>

            </div>
          </div>

          
          <div className="space-y-3.5">
            <h3 className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-neutral-500" />
              {isRTL ? 'أهم المحافظات مبيعاً' : 'Top Cities Sales'}
            </h3>
            
            <div className="space-y-3">
              {governorates.length === 0 ? (
                <p className="text-[10px] text-neutral-400">{isRTL ? 'لا توجد بيانات جغرافية كافية' : 'Not enough location data'}</p>
              ) : (
                governorates.map((gov, idx) => {
                  const maxGovRevenue = governorates[0]?.revenue || 1;
                  const percent = Math.min(100, Math.round((gov.revenue / maxGovRevenue) * 100));
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-neutral-800">
                        <span>{gov.city}</span>
                        <span className="font-serif-en">{formatCurrency(gov.revenue)}</span>
                      </div>
                      <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-black rounded-full" 
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>

     
      <div className="bg-white border border-neutral-100 rounded-3xl p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-neutral-900">
            {isRTL ? 'المنتجات الأكثر مبيعاً' : 'Best Selling Products'}
          </h3>
          <p className="text-[10px] text-neutral-400">
            {isRTL ? 'أفضل المنتجات أداءً بناءً على إجمالي كميات الشراء' : 'Top products ordered by sales volume'}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-neutral-800 border-collapse">
            <thead>
              <tr className="border-b border-neutral-100 text-neutral-400 text-[10px] uppercase font-bold text-right">
                <th className={`pb-3 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'المنتج' : 'Product'}</th>
                <th className="pb-3 text-center">{isRTL ? 'سعر الوحدة' : 'Unit Price'}</th>
                <th className="pb-3 text-center">{isRTL ? 'الكمية المباعة' : 'Units Sold'}</th>
                <th className="pb-3 text-center">{isRTL ? 'إجمالي المبيعات' : 'Total Revenue'}</th>
              </tr>
            </thead>
            <tbody>
              {bestSellers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-6 text-neutral-400">
                    {isRTL ? 'لا توجد مبيعات مسجلة حتى الآن' : 'No sales recorded yet'}
                  </td>
                </tr>
              ) : (
                bestSellers.map((item, idx) => (
                  <tr key={idx} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors">
                    <td className="py-3 flex items-center gap-3">
                      <div className="w-9 h-12 bg-neutral-50 rounded border border-neutral-100 overflow-hidden flex-shrink-0">
                        <img 
                          src={item.imageCover || '/p1.jpeg'} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="font-bold text-neutral-900 truncate max-w-xs">{item.name}</span>
                    </td>
                    <td className="py-3 text-center font-serif-en font-bold">{formatCurrency(item.price)}</td>
                    <td className="py-3 text-center">
                      <span className="bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded-full font-serif-en font-bold">
                        {formatNumber(item.totalSold)}
                      </span>
                    </td>
                    <td className="py-3 text-center font-serif-en font-black text-neutral-900">
                      {formatCurrency(item.totalRevenue)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
