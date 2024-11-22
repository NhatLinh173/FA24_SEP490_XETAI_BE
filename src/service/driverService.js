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

const updateDriverStatistics = async (driverId, tripData) => {
  try {
    const { trips, earnings } = tripData;

    if (isNaN(trips) || isNaN(earnings)) {
      throw new Error("Trips and earnings must be valid numbers");
    }

    const currentDate = new Date();
    const currentHour = `${currentDate.getHours()}:00`;
    const currentDay = currentDate.toISOString().slice(0, 10); // YYYY-MM-DD
    const currentWeekDay = currentDate.toLocaleDateString("en-US", {
      weekday: "long",
    });
    const currentMonth = `${currentDate.getFullYear()}-${
      currentDate.getMonth() + 1
    }`;
    const currentYear = `${currentDate.getFullYear()}`;

    const driver = await Driver.findById(driverId);

    if (!driver) {
      throw new Error("Driver not found!");
    }

    const todayStats = driver.statistics.today.find(
      (item) => item.hour === currentHour
    );
    if (todayStats) {
      todayStats.trips += trips;
      todayStats.earnings += earnings;
    } else {
      driver.statistics.today.push({
        hour: currentHour,
        trips,
        earnings,
        timestamp: currentDate,
      });
    }

    // Cập nhật thống kê "thisWeek"
    const weekStats = driver.statistics.thisWeek.find(
      (item) => item.day === currentWeekDay
    );
    if (weekStats) {
      weekStats.trips += trips;
      weekStats.earnings += earnings;
    } else {
      driver.statistics.thisWeek.push({
        day: currentWeekDay,
        trips,
        earnings,
        timestamp: currentDate,
      });
    }

    // Cập nhật thống kê "thisMonth"
    const monthStats = driver.statistics.thisMonth.find(
      (item) => item.date === currentDay
    );
    if (monthStats) {
      monthStats.trips += trips;
      monthStats.earnings += earnings;
    } else {
      driver.statistics.thisMonth.push({
        date: currentDay,
        trips,
        earnings,
        timestamp: currentDate,
      });
    }

    // Cập nhật thống kê "thisYear"
    const yearStats = driver.statistics.thisYear.find(
      (item) => item.year === currentYear && item.month === currentMonth
    );
    if (yearStats) {
      yearStats.trips += trips;
      yearStats.earnings += earnings;
    } else {
      driver.statistics.thisYear.push({
        year: currentYear,
        month: currentMonth,
        trips,
        earnings,
        timestamp: currentDate,
      });
    }

    // Lưu lại tài xế với thông tin cập nhật
    await driver.save();

    return { success: true, message: "Statistics updated successfully!" };
  } catch (error) {
    console.error("Error updating statistics:", error);
    return { success: false, message: error.message };
  }
};

module.exports = {
  getDriverById,
  getDriverStatistics,
  updateDriverStatistics,
};
