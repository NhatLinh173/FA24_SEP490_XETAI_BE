const Driver = require("../model/driverModel");
const User = require("../model/userModel");
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

    if (!driver.statistics) {
      driver.statistics = {
        today: [],
        yesterday: [],
        thisWeek: [],
        thisMonth: [],
        lastMonth: [],
        thisYear: [],
        lastYear: [],
      };
      await driver.save();
    }

    const userId = driver.userId;
    if (!userId) {
      throw new Error("Không tìm thấy thông tin người dùng");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error("Không tìm thấy thông tin người dùng");
    }

    return {
      driver,
      user,
    };
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
  "Năm nay": "thisYear",
  "Năm trước": "lastYear",
};

const getDriverStatistics = async (driverId, range) => {
  try {
    const driverData = await getDriverById(driverId);

    if (!driverData || !driverData.driver) {
      throw new Error("Không tìm thấy thông tin tài xế");
    }

    if (!driverData.driver.statistics) {
      driverData.driver.statistics = {
        today: [],
        yesterday: [],
        thisWeek: [],
        thisMonth: [],
        lastMonth: [],
        thisYear: [],
        lastYear: [],
      };
      await driverData.driver.save();
    }

    const statistics = {};
    const mappedRange = rangeMapping[range];

    if (!mappedRange) {
      throw new Error("Khoảng thời gian không hợp lệ");
    }

    switch (mappedRange) {
      case "yesterday":
        statistics.yesterday = await getStatisticsForYesterday(driverData);
        break;
      case "today":
        statistics.today = await getStatisticsForToday(driverData);
        break;
      case "thisWeek":
        statistics.week = await getStatisticsForThisWeek(driverData);
        break;
      case "thisMonth":
        statistics.month = await getStatisticsForThisMonth(driverData);
        break;
      case "lastMonth":
        statistics.lastMonth = await getStatisticsForLastMonth(driverData);
        break;
      case "thisYear":
        statistics.thisYear = await getStatisticsForThisYear(driverData);
        break;
      case "lastYear":
        statistics.lastYear = await getStatisticsForLastYear(driverData);
        break;
      default:
        throw new Error("Khoảng thời gian không hợp lệ");
    }
    console.log("Statistics being returned:", statistics);
    return statistics;
  } catch (error) {
    console.error("Error in getDriverStatistics:", error);
    throw error;
  }
};

// Các hàm lấy thống kê cho từng khoảng thời gian
const getStatisticsForToday = async (driverData) => {
  if (!driverData?.driver?.statistics?.today) {
    return [];
  }
  return driverData.driver.statistics.today;
};

const getStatisticsForYesterday = async (driverData) => {
  if (!driverData?.driver?.statistics?.yesterday) {
    return [];
  }
  return driverData.driver.statistics.yesterday;
};

const getStatisticsForThisWeek = async (driverData) => {
  if (!driverData?.driver?.statistics?.thisWeek) {
    return [];
  }
  return driverData.driver.statistics.thisWeek;
};

const getStatisticsForThisMonth = async (driverData) => {
  if (!driverData?.driver?.statistics?.thisMonth) {
    return [];
  }
  return driverData.driver.statistics.thisMonth;
};

const getStatisticsForLastMonth = async (driverData) => {
  if (!driverData?.driver?.statistics?.lastMonth) {
    return [];
  }
  return driverData.driver.statistics.lastMonth;
};

const getStatisticsForThisYear = async (driverData) => {
  if (!driverData?.driver?.statistics?.thisYear) {
    return [];
  }
  return driverData.driver.statistics.thisYear;
};

const getStatisticsForLastYear = async (driverData) => {
  if (!driverData?.driver?.statistics?.lastYear) {
    return [];
  }
  return driverData.driver.statistics.lastYear;
};

const updateDriverStatistics = async (driverId, tripData) => {
  try {
    const { trips, earnings } = tripData;

    if (isNaN(trips) || isNaN(earnings)) {
      throw new Error("Trips and earnings must be valid numbers");
    }

    const currentDate = new Date();
    const currentHour = `${currentDate.getHours()}:00`;
    const currentDay = currentDate.toISOString().slice(0, 10);
    const currentWeekDay = currentDate.toLocaleDateString("en-US", {
      weekday: "long",
    });
    const currentMonth = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}`;
    const currentYear = currentDate.getFullYear().toString();

    const driver = await Driver.findById(driverId);
    if (!driver) {
      throw new Error("Driver not found!");
    }
    if (!driver.statistics) {
      driver.statistics = {
        today: [],
        yesterday: [],
        thisWeek: [],
        lastWeek: [],
        thisMonth: [],
        lastMonth: [],
        thisYear: [],
        lastYear: [],
      };
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

    const yearStats = driver.statistics.thisYear.find(
      (item) => item.month === currentMonth
    );
    if (yearStats) {
      yearStats.trips += trips;
      yearStats.earnings += earnings;
    } else {
      driver.statistics.thisYear.push({
        month: currentMonth,
        trips,
        earnings,
        timestamp: currentDate,
      });
    }

    await driver.save();

    return { success: true, message: "Statistics updated successfully!" };
  } catch (error) {
    console.error("Error updating statistics:", error);
    throw error;
  }
};

module.exports = {
  getDriverById,
  getDriverStatistics,
  updateDriverStatistics,
};
