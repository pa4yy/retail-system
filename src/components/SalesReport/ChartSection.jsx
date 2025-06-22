import React from "react";
import ReactApexChart from "react-apexcharts";

const ChartSection = ({ chartData }) => (
  <div className="bg-white rounded shadow p-4 mb-4">
    <ReactApexChart
      options={chartData.options}
      series={chartData.series}
      type="bar"
      height={350}
    />
  </div>
);

export default ChartSection; 