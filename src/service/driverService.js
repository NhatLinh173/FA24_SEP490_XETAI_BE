const Driver = require("../model/driverModel");

const fillterEarningsByDate = (earningsHistory, startDate, endDate) => {
  return earningsHistory.filter((earning) => {
    const earningDate = new Date(earning.date);
    return (
      earningDate >= new Date(startDate) && earningDate <= new Date(endDate)
    );
  });
};



const getDriverById = async (driverId) => {
  try {
    const driver = await Driver.findById(driverId);
    if (!driver) {
      throw new Error("Driver not found");
    }
    return driver;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const updateEarnings = async (driverId, amount) => {
  try {
    const newEarning = {
      date: new Date(),
      amount: amount,
    };
    await Driver.findByIdAndUpdate(
      driverId,
      {
        $push: { earningsHistory: newEarning },
      },
      {
        new: true,
        useFindAndModify: true,
      }
    );
    return { success: true, message: "Update Successfully" };
  } catch (error) {
    return {
      success: false,
      message: "Failed update earningsHistory",
      error,
    };
  }
};

const getEarningsToday = (earningsHistory) => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  const earningsToday = fillterEarningsByDate(
    earningsHistory,
    startOfDay,
    endOfDay
  );
  const totalEarnings = earningsToday.reduce(
    (acc, earning) => acc + earning.amount,
    0
  );

  return totalEarnings;
};

const getEarningsYesterday = (earningsHistory) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const startOfYesterday = new Date(yesterday.setHours(0, 0, 0, 0));
  const endOfYesterday = new Date(yesterday.setHours(23, 59, 59, 999));

  const earningsYesterday = fillterEarningsByDate(
    earningsHistory,
    startOfYesterday,
    endOfYesterday
  );
  const totalEarnings = earningsYesterday.reduce(
    (acc, earning) => acc + earning.amount,
    0
  );

  return totalEarnings;
};

const getEarningsThisWeek = (earningsHistory) => {
  const today = new Date();
  const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date();
  endOfWeek.setHours(23, 59, 59, 999);

  const earningsThisWeek = fillterEarningsByDate(
    earningsHistory,
    startOfWeek,
    endOfWeek
  );
  const totalEarnings = earningsThisWeek.reduce(
    (acc, earning) => acc + earning.amount,
    0
  );

  return totalEarnings;
};

const getEarningsThisMonth = (earningsHistory) => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );

  const earningsThisMonth = fillterEarningsByDate(
    earningsHistory,
    startOfMonth,
    endOfMonth
  );
  const totalEarnings = earningsThisMonth.reduce(
    (acc, earning) => acc + earning.amount,
    0
  );

  return totalEarnings;
};

const getEarningsThisYear = (earningsHistory) => {
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  const endOfYear = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);

  const earningsThisYear = fillterEarningsByDate(
    earningsHistory,
    startOfYear,
    endOfYear
  );
  const totalEarnings = earningsThisYear.reduce(
    (acc, earning) => acc + earning.amount,
    0
  );

  return totalEarnings;
};

module.exports = {
  getDriverById,
  updateEarnings,
  getEarningsToday,
  getEarningsYesterday,
  getEarningsThisWeek,
  getEarningsThisMonth,
  getEarningsThisYear,
};
