import React, { useEffect, useState, useCallback } from "react";
import MainLayout from "../layout/MainLayout";
import { useAuth } from "../../data/AuthContext";
import axios from "axios";
import ChartSection from "./ChartSection";
import SummarySection from "./SummarySection";
import TopProductsTable from "./TopProductsTable";
import FilterControls from "./FilterControls";
import {
  getDefaultDate,
  getMonthRange,
  getYearRange,
} from "../../utils/dateUtils";
import { parseISO, startOfWeek, endOfWeek, format } from "date-fns";
import thLocale from "date-fns/locale/th";

function getDateLimits() {
  const now = new Date();
  const currentYear = now.getFullYear();
  return {
    minYear: currentYear - 5,
    maxYear: currentYear,
    minMonth: `${currentYear - 5}-01`,
    maxMonth: `${currentYear}-12`,
    minDate: `${currentYear - 5}-01-01`,
    maxDate: now.toISOString().split("T")[0],
  };
}

function SalesReport() {
  const { user } = useAuth();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [groupBy, setGroupBy] = useState("month");
  const [startMonth, setStartMonth] = useState("");
  const [endMonth, setEndMonth] = useState("");
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");
  const [chartData, setChartData] = useState({ options: {}, series: [] });
  const [summary, setSummary] = useState({
    totalSales: 0,
    totalCost: 0,
    totalProfit: 0,
  });
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProductType, setSelectedProductType] = useState("all");
  const [productTypes, setProductTypes] = useState([]);
  const [dateLimits] = useState(getDateLimits());

  useEffect(() => {
    const [d1, d2] = getDefaultDate(groupBy);
    if (groupBy === "day" || groupBy === "week") {
      setStartDate(d1);
      setEndDate(d2);
    } else if (groupBy === "month") {
      setStartMonth(d1);
      setEndMonth(d2);
    } else if (groupBy === "year") {
      setStartYear(d1);
      setEndYear(d2);
    }
  }, [groupBy]);

  const resetFilter = () => {
    const [d1, d2] = getDefaultDate(groupBy);
    if (groupBy === "day" || groupBy === "week") {
      setStartDate(d1);
      setEndDate(d2);
    } else if (groupBy === "month") {
      setStartMonth(d1);
      setEndMonth(d2);
    } else if (groupBy === "year") {
      setStartYear(d1);
      setEndYear(d2);
    }
  };

  const fetchProductTypes = useCallback(() => {
    axios
      .get("http://localhost:5000/api/product_types")
      .then((res) => {
        setProductTypes(res.data);
      })
      .catch((err) => {
        console.error("Error fetching product types:", err);
      });
  }, []);

  useEffect(() => {
    fetchProductTypes();
  }, [fetchProductTypes]);

  const fetchSalesData = useCallback(() => {
    setLoading(true);
    setError(null);
    axios
      .get("http://localhost:5000/api/sales")
      .then((res) => {
        const data = res.data;
        let filteredData = data;


        if (groupBy === "day" || groupBy === "week") {
          filteredData = data.filter((sale) => {
            const saleDate = sale.Sale_Date ? sale.Sale_Date.slice(0, 10) : "";
            return (
              startDate &&
              saleDate >= startDate &&
              endDate &&
              saleDate <= endDate
            );
          });


        } else if (groupBy === "month") {
          const monthRange = getMonthRange(startMonth, endMonth);
          filteredData = data.filter((sale) => {
            const saleMonth = sale.Sale_Date.slice(0, 7);
            return monthRange.includes(saleMonth);
          });


        } else if (groupBy === "year") {
          filteredData = data.filter((sale) => {
            const saleYear = sale.Sale_Date.slice(0, 4);
            return (
              startYear &&
              saleYear >= startYear &&
              endYear &&
              saleYear <= endYear
            );
          });
        }


        let categories = [];
        let salesData = [];
        let costData = [];
        let profitData = [];
        let groupMap = {};
        let productMap = {};
        let totalSales = 0,
          totalCost = 0,
          totalProfit = 0;

        if (groupBy === "day") {
          filteredData.forEach((sale) => {
            const day = sale.Sale_Date.slice(0, 10);
            if (!groupMap[day])
              groupMap[day] = { sales: 0, cost: 0, profit: 0 };
            groupMap[day].sales += Number(sale.Total_Sale_Price);
            sale.Sale_Detail.forEach((item) => {
              const cost = item.Cost || 0;
              groupMap[day].cost += cost * item.Sale_Amount;
            });
          });
          categories = Object.keys(groupMap).sort().map(String);
          salesData = categories.map((day) => groupMap[day]?.sales || 0);
          costData = categories.map((day) => groupMap[day]?.cost || 0);
          profitData = categories.map((day, i) => salesData[i] - costData[i]);


        } else if (groupBy === "week") {
          filteredData.forEach((sale) => {
            const date = parseISO(sale.Sale_Date);
            const weekStart = format(
              startOfWeek(date, { weekStartsOn: 1 }),
              "yyyy-MM-dd"
            );
            if (!groupMap[weekStart])
              groupMap[weekStart] = { sales: 0, cost: 0, profit: 0 };
            groupMap[weekStart].sales += Number(sale.Total_Sale_Price);
            sale.Sale_Detail.forEach((item) => {
              const cost = item.Cost || 0;
              groupMap[weekStart].cost += cost * item.Sale_Amount;
            });
          });
          const weekKeys = Object.keys(groupMap).sort();
          categories = weekKeys.map((weekStart) => {
            const start = parseISO(weekStart);
            const end = endOfWeek(start, { weekStartsOn: 1 });
            return `${format(start, "d MMM", { locale: thLocale })} - ${format(
              end,
              "d MMM yyyy",
              { locale: thLocale }
            )}`;
          });
          salesData = weekKeys.map((weekStart) => groupMap[weekStart].sales);
          costData = weekKeys.map((weekStart) => groupMap[weekStart].cost);
          profitData = salesData.map((v, i) => v - costData[i]);


        } else if (groupBy === "month") {
          const months = [
            "มกราคม",
            "กุมภาพันธ์",
            "มีนาคม",
            "เมษายน",
            "พฤษภาคม",
            "มิถุนายน",
            "กรกฎาคม",
            "สิงหาคม",
            "กันยายน",
            "ตุลาคม",
            "พฤศจิกายน",
            "ธันวาคม",
          ];
          let monthMap = {};
          filteredData.forEach((sale) => {
            const date = new Date(sale.Sale_Date);
            const month = date.getMonth();
            const year = date.getFullYear();
            const key = `${months[month]} ${year}`;
            if (!monthMap[key]) monthMap[key] = { sales: 0, cost: 0 };
            monthMap[key].sales += Number(sale.Total_Sale_Price);
            sale.Sale_Detail.forEach((item) => {
              const cost = item.Cost || 1;
              monthMap[key].cost += cost * item.Sale_Amount;
            });
          });
          const monthRange = getMonthRange(startMonth, endMonth);
          categories = monthRange.map((m) => {
            const [y, mo] = m.split("-");
            return `${months[parseInt(mo, 10) - 1]} ${y}`;
          });
          salesData = monthRange.map((m) => {
            const [y, mo] = m.split("-");
            const key = `${months[parseInt(mo, 10) - 1]} ${y}`;
            return monthMap[key]?.sales || 0;
          });
          costData = monthRange.map((m) => {
            const [y, mo] = m.split("-");
            const key = `${months[parseInt(mo, 10) - 1]} ${y}`;
            return monthMap[key]?.cost || 0;
          });
          profitData = salesData.map((v, i) => v - costData[i]);


        } else if (groupBy === "year") {
          const yearMap = {};
          filteredData.forEach((sale) => {
            const year = sale.Sale_Date.slice(0, 4);
            if (!yearMap[year])
              yearMap[year] = { sales: 0, cost: 0, profit: 0 };
            yearMap[year].sales += Number(sale.Total_Sale_Price);
            sale.Sale_Detail.forEach((item) => {
              const cost = item.Cost || 0;
              yearMap[year].cost += cost * item.Sale_Amount;
            });
          });
          const yearRange = getYearRange(startYear, endYear);
          categories = yearRange.map(String);
          salesData = yearRange.map((year) => yearMap[year]?.sales || 0);
          costData = yearRange.map((year) => yearMap[year]?.cost || 0);
          profitData = yearRange.map((year, i) => salesData[i] - costData[i]);
        }


        totalSales = salesData.reduce((a, b) => a + b, 0);
        totalCost = costData.reduce((a, b) => a + b, 0);
        totalProfit = profitData.reduce((a, b) => a + b, 0);
        
        filteredData.forEach((sale) => {
          sale.Sale_Detail.forEach((item) => {
            const cost = item.Cost || 0;
            const saleAmount = item.Sale_Amount || 0;
            const salePrice = item.Sale_Price || 0;
            if (!productMap[item.Product_Name]) {
              productMap[item.Product_Name] = {
                name: item.Product_Name,
                type: item.Product_Type || "-",
                price: salePrice,
                amount: 0,
                totalCost: 0,
              };
            }
            productMap[item.Product_Name].amount += saleAmount;
            productMap[item.Product_Name].totalCost += cost * saleAmount;
          });
        });


        let filteredProducts = Object.values(productMap);
        if (selectedProductType !== "all") {
          filteredProducts = filteredProducts.filter(
            (product) => product.type === selectedProductType
          );
        }
        const topProductsArr = filteredProducts
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 10);
        setChartData({
          options: {
            chart: { id: "sales-bar" },
            xaxis: { categories },
            title: { text: "" },
            yaxis: {
              title: { text: "จำนวนเงิน (บาท)" },
              labels: { formatter: (val) => Number(val).toFixed(2) },
            },
            dataLabels: {
              enabled: false,
              formatter: (val) =>
                Number(val).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }),
              style: {
                fontSize: "16px",
                fontWeight: "bold",
                colors: ["#1a73e8", "#f44336", "#ff9800"],
              },
              dropShadow: {
                enabled: true,
                top: 2,
                left: 0,
                blur: 2,
                color: "#fff",
                opacity: 0.9,
              },
            },
            plotOptions: {
              bar: {
                dataLabels: {
                  position: "top",
                },
              },
            },
            colors: ["#1a73e8", "#f44336", "#ff9800"],
            legend: { position: "top" },
            tooltip: {
              shared: true,
              intersect: false,
              y: { formatter: (val) => Number(val).toFixed(2) },
            },
          },
          series: [
            {
              name: "ยอดขายรวม (บาท)",
              data: salesData,
              dataLabels: {
                offsetY: -25,
              },
            },
            {
              name: "ต้นทุนรวม (บาท)",
              data: costData,
              dataLabels: {
                offsetY: 35,
              },
            },
            {
              name: "กำไรสุทธิ (บาท)",
              data: profitData,
              dataLabels: {
                offsetY: 15,
              },
            },
          ],
        });
        setSummary({ totalSales, totalCost, totalProfit });
        setTopProducts(topProductsArr);
        setLoading(false);
      })
      .catch(() => {
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
        setLoading(false);
      });
  }, [
    startDate,
    endDate,
    groupBy,
    startMonth,
    endMonth,
    startYear,
    endYear,
    selectedProductType,
  ]);

  useEffect(() => {
    fetchSalesData();
  }, [fetchSalesData]);

  return (
    <MainLayout user={user} title="รายงานการขาย">
      <h2 className="text-2xl font-bold mb-4">รายงานการขาย</h2>
      <FilterControls
        groupBy={groupBy}
        setGroupBy={setGroupBy}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        startMonth={startMonth}
        setStartMonth={setStartMonth}
        endMonth={endMonth}
        setEndMonth={setEndMonth}
        startYear={startYear}
        setStartYear={setStartYear}
        endYear={endYear}
        setEndYear={setEndYear}
        dateLimits={dateLimits}
        resetFilter={resetFilter}
        selectedProductType={selectedProductType}
        setSelectedProductType={setSelectedProductType}
        productTypes={productTypes}
      />
      <div className="text-sm text-gray-600 mb-4">
        * สามารถดูข้อมูลย้อนหลังได้ไม่เกิน 5 ปี
      </div>
      {loading ? (
        <div className="text-center py-8">กำลังโหลดข้อมูล...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-8">{error}</div>
      ) : chartData.series.length === 0 ||
        chartData.series[0].data.every((v) => v === 0) ? (
        <div className="text-center py-8">ไม่พบข้อมูลในช่วงเวลาที่เลือก</div>
      ) : (
        <>
          <ChartSection chartData={chartData} />
          <SummarySection summary={summary} />
          <div className="mb-4">
            <div className="flex items-center gap-4 mb-2">
              <h2 className="text-xl font-bold">10 อันดับสินค้าขายดี</h2>
              <div className="flex items-center gap-2">
                <label className="font-medium" htmlFor="productType">ประเภทสินค้า:</label>
                <select
                  id="productType"
                  className="border px-3 py-2 rounded"
                  value={selectedProductType}
                  onChange={(e) => setSelectedProductType(e.target.value)}
                >
                  <option value="all">ทั้งหมด</option>
                  {productTypes.map((type) => (
                    <option key={type.PType_Id} value={type.PType_Name}>{type.PType_Name}</option>
                  ))}
                </select>
              </div>
            </div>
            {topProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                ไม่พบข้อมูลสินค้าที่ขายในช่วงเวลาที่เลือก
              </div>
            ) : (
              <div className="overflow-y-auto" style={{ maxHeight: "450px" }}>
                <TopProductsTable products={topProducts} />
              </div>
            )}
          </div>
        </>
      )}
    </MainLayout>
  );
}

export default SalesReport; 