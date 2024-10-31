const Driver = require("../model/driverModel");
const cron = require("node-cron");

cron.schedule("0 0 * * *", async () => {
  try {
    const drivers = await Driver.find();

    for (const driver of drivers) {
      driver.statistics.yesterday = driver.statistics.today.map((stat) => ({
        ...stat,
      }));

      driver.statistics.today = [];

      const currentDate = new Date();
      const isStartOfWeek = currentDate.getDay() === 1;
      if (isStartOfWeek) {
        driver.statistics.lastWeek = driver.statistics.thisWeek || [];
        driver.statistics.thisWeek = [];
      }

      const isStartOfMonth = currentDate.getDate() === 1;
      if (isStartOfMonth) {
        driver.statistics.lastMonth = driver.statistics.thisMonth || [];
        driver.statistics.thisMonth = [];
      }

      const isStartOfYear =
        currentDate.getMonth() === 0 && currentDate.getDate() === 1;
      if (isStartOfYear) {
        driver.statistics.lastYear = driver.statistics.thisYear || [];
        driver.statistics.thisYear = [];
      }

      await driver.save();
    }

    console.log("Đã cập nhật thống kê thành công cho tất cả tài xế");
  } catch (error) {
    console.error("Lỗi khi cập nhật thống kê tài xế:", error);
  }
});

const getDriverById = async (driverId) => {
  try {
    const driver = await Driver.findById(driverId);
    if (!driver) {
      throw new Error("Tài xế không tồn tại");
    }
    return driver;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const rangeMapping = {
  "Hôm qua": "yesterday",
  "Hôm nay": "today",
  "Tuần này": "thisWeek",
  "Tháng này": "thisMonth",
  "Tháng trước": "lastMonth",
  "Năm này": "thisYear",
  "Năm trước": "lastYear",
};

const getDriverStatistics = async (driverId, range) => {
  const driver = await getDriverById(driverId);
  const statistics = {};

  const mappedRange = rangeMapping[range];
  if (!mappedRange) {
    throw new Error("Khoảng thời gian không hợp lệ");
  }

  switch (mappedRange) {
    case "yesterday":
      statistics.yesterday = await getStatisticsForYesterday(driver);
      break;
    case "today":
      statistics.today = await getStatisticsForToday(driver);
      break;
    case "thisWeek":
      statistics.week = await getStatisticsForThisWeek(driver);
      break;
    case "thisMonth":
      statistics.month = await getStatisticsForThisMonth(driver);
      break;
    case "lastMonth":
      statistics.lastMonth = await getStatisticsForLastMonth(driver);
      break;
    case "thisYear":
      statistics.year = await getStatisticsForThisYear(driver);
      break;
    case "lastYear":
      statistics.lastYear = await getStatisticsForLastYear(driver);
      break;
    default:
      throw new Error("Khoảng thời gian không hợp lệ");
  }

  return statistics;
};

// Các hàm lấy thống kê cho từng khoảng thời gian
const getStatisticsForToday = async (driver) => {
  return driver.statistics.today;
};

const getStatisticsForYesterday = async (driver) => {
  return driver.statistics.yesterday;
};

const getStatisticsForThisWeek = async (driver) => {
  return driver.statistics.thisWeek;
};

const getStatisticsForThisMonth = async (driver) => {
  return driver.statistics.thisMonth;
};

const getStatisticsForLastMonth = async (driver) => {
  return driver.statistics.lastMonth;
};

const getStatisticsForThisYear = async (driver) => {
  return driver.statistics.thisYear;
};

const getStatisticsForLastYear = async (driver) => {
  return driver.statistics.lastYear;
};

const updateDriverStatistics = async (driverId, earnings, trips) => {
  const driver = await Driver.findById(driverId);
  const timestamp = new Date();

  const currentHour = timestamp.getHours().toString().padStart(2, "0");
  const currentDay = timestamp.toLocaleDateString("vi-VN", { day: "2-digit" });
  const currentMonth = timestamp.toLocaleDateString("vi-VN", { month: "long" });
  const currentYear = timestamp.getFullYear().toString();
  const currentDate = timestamp.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  });

  const todayStat = driver.statistics.today.find(
    (stat) => stat.hour === currentHour
  ) || { hour: currentHour, trips: 0, earnings: 0, timestamp };

  todayStat.trips += trips;
  todayStat.earnings += earnings;

  if (!driver.statistics.today.some((stat) => stat.hour === currentHour)) {
    driver.statistics.today.push(todayStat);
  }

  // Cập nhật thống kê của tuần này
  const todayDayStat = driver.statistics.thisWeek.find(
    (stat) => stat.day === currentDate
  ) || { day: currentDate, trips: 0, earnings: 0, timestamp };

  todayDayStat.trips += trips;
  todayDayStat.earnings += earnings;

  if (!driver.statistics.thisWeek.some((stat) => stat.day === currentDate)) {
    driver.statistics.thisWeek.push(todayDayStat);
  }

  // Cập nhật thống kê của tháng này
  const todayMonthStat = driver.statistics.thisMonth.find(
    (stat) => stat.date === currentMonth
  ) || { date: currentMonth, trips: 0, earnings: 0, timestamp };

  todayMonthStat.trips += trips;
  todayMonthStat.earnings += earnings;

  if (!driver.statistics.thisMonth.some((stat) => stat.date === currentMonth)) {
    driver.statistics.thisMonth.push(todayMonthStat);
  }

  driver.tripsThisWeek = driver.statistics.thisWeek.reduce(
    (acc, stat) => acc + stat.trips,
    0
  );

  driver.tripsThisMonth = driver.statistics.thisMonth.reduce(
    (acc, stat) => acc + stat.trips,
    0
  );

  const thisYearStat = driver.statistics.thisYear.find(
    (stat) => stat.year === currentYear && stat.month === currentMonth
  ) || {
    year: currentYear,
    month: currentMonth,
    trips: 0,
    earnings: 0,
    timestamp,
  };

  thisYearStat.trips += trips;
  thisYearStat.earnings += earnings;

  if (
    !driver.statistics.thisYear.some(
      (stat) => stat.year === currentYear && stat.month === currentMonth
    )
  ) {
    driver.statistics.thisYear.push(thisYearStat);
  }

  await driver.save();
};


module.exports = {
  getDriverById,
  getDriverStatistics,
  updateDriverStatistics,
};
