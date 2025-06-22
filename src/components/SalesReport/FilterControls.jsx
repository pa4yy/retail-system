import React from "react";

const FilterControls = ({
  groupBy, setGroupBy,
  startDate, setStartDate, endDate, setEndDate,
  startMonth, setStartMonth, endMonth, setEndMonth,
  startYear, setStartYear, endYear, setEndYear,
  dateLimits, resetFilter
}) => (
  <div className="flex flex-wrap gap-2 mb-2 items-center">
    <label className="font-medium" htmlFor="groupBy">ดูข้อมูลแบบ</label>
    <select
      id="groupBy"
      className="border px-2 py-1 rounded"
      value={groupBy}
      onChange={(e) => setGroupBy(e.target.value)}
      aria-label="เลือกประเภทการดูข้อมูล"
    >
      <option value="day">รายวัน</option>
      <option value="week">รายสัปดาห์</option>
      <option value="month">รายเดือน</option>
      <option value="year">รายปี</option>
    </select>
    {groupBy === "day" || groupBy === "week" ? (
      <>
        <label className="ml-4 font-medium" htmlFor="startDate">วันที่</label>
        <input
          id="startDate"
          type="date"
          className="border px-3 py-2 rounded"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          min={dateLimits.minDate}
          max={endDate || dateLimits.maxDate}
          aria-label="เลือกวันที่เริ่มต้น"
        />
        <span>ถึง</span>
        <input
          id="endDate"
          type="date"
          className="border px-3 py-2 rounded"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          min={startDate || dateLimits.minDate}
          max={dateLimits.maxDate}
          aria-label="เลือกวันที่สิ้นสุด"
        />
      </>
    ) : groupBy === "month" ? (
      <>
        <label className="ml-4 font-medium" htmlFor="startMonth">เดือน</label>
        <input
          id="startMonth"
          type="month"
          className="border px-3 py-2 rounded"
          value={startMonth}
          onChange={(e) => setStartMonth(e.target.value)}
          min={dateLimits.minMonth}
          max={endMonth || dateLimits.maxMonth}
          aria-label="เลือกเดือนเริ่มต้น"
        />
        <span>ถึง</span>
        <input
          id="endMonth"
          type="month"
          className="border px-3 py-2 rounded"
          value={endMonth}
          onChange={(e) => setEndMonth(e.target.value)}
          min={startMonth || dateLimits.minMonth}
          max={dateLimits.maxMonth}
          aria-label="เลือกเดือนสิ้นสุด"
        />
      </>
    ) : (
      <>
        <label className="ml-4 font-medium" htmlFor="startYear">ปี</label>
        <select
          id="startYear"
          className="border px-3 py-2 rounded w-24"
          value={startYear}
          onChange={(e) => setStartYear(e.target.value)}
          aria-label="เลือกปีเริ่มต้น"
        >
          {Array.from({ length: dateLimits.maxYear - dateLimits.minYear + 1 }, (_, i) => dateLimits.minYear + i).map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
        <span>ถึง</span>
        <select
          id="endYear"
          className="border px-3 py-2 rounded w-24"
          value={endYear}
          onChange={(e) => setEndYear(e.target.value)}
          aria-label="เลือกปีสิ้นสุด"
        >
          {Array.from({ length: dateLimits.maxYear - dateLimits.minYear + 1 }, (_, i) => dateLimits.minYear + i).map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </>
    )}
    <button
      className="ml-4 px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
      onClick={resetFilter}
      aria-label="รีเซ็ตตัวกรอง"
    >
      รีเซ็ต
    </button>
  </div>
);

export default FilterControls; 