const emailTemplates = {
  orderConfirmation: (userName, orderId) => `
    <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px; text-align: center;">
      <h1 style="color: #333; font-size: 24px;">Xác nhận đơn hàng</h1>
      <p style="color: #555; font-size: 16px;">Xin chào ${userName},</p>
      <p style="color: #555; font-size: 16px;">
        Đơn hàng của bạn với mã <strong>${orderId}</strong> đã được xác nhận thành công!
      </p>
      <p style="color: #555; font-size: 16px;">Vui lòng bạn chuẩn bị hàng hóa để tài xế có thể đến nhận hàng!</p>
      <a href="http://localhost:3000/service/${orderId}" style="display: inline-block; padding: 10px 20px; background-color: #28a745; color: #fff; text-decoration: none; border-radius: 5px;">Xem đơn hàng của bạn</a>
      <p style="color: #555; font-size: 16px;">Công ty Vận Tải RFTMS cảm ơn quý khách đã tin tưởng và chọn lựa chúng tôi</p>
    </div>
  `,

  orderDealPrice: (userName, orderId, driverId) => `
    <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px; text-align: center;">
      <h1 style="color: #333; font-size: 24px;">Thương lượng giá vận chuyển</h1>
      <p style="color: #555; font-size: 16px;">Xin chào ${userName},</p>
      <p style="color: #555; font-size: 16px;">
        Đơn hàng của bạn với mã <strong>${orderId}</strong> đã được tài xế ${driverId} thương lượng giá.
      </p>
      <p style="color: #555; font-size: 16px;">Vui lòng kiểm tra và chọn giá phù hợp với đơn hàng của mình!</p>
      <a href="http://localhost:3000/service/${orderId}" style="display: inline-block; padding: 10px 20px; background-color: #28a745; color: #fff; text-decoration: none; border-radius: 5px;">Xem đơn hàng của bạn</a>
      <p style="color: #555; font-size: 16px;">Công ty Vận Tải RFTMS cảm ơn quý khách đã tin tưởng và chọn lựa chúng tôi</p>
    </div>
  `,

  passwordChange: (userName) => `
    <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px; text-align: center;">
      <h1 style="color: #333; font-size: 24px;">Thông báo thay đổi mật khẩu</h1>
      <p style="color: #555; font-size: 16px;">Xin chào ${userName},</p>
      <p style="color: #555; font-size: 16px;">Mật khẩu của bạn đã được thay đổi thành công!</p>
      <p style="color: #555; font-size: 16px;">Nếu bạn không thực hiện thay đổi này, vui lòng liên hệ với chúng tôi ngay.</p>
    </div>
  `,

  orderDelivered: (userName, orderId) => `
    <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px; text-align: center;">
      <h1 style="color: #333; font-size: 24px;">Thông báo đơn hàng đã giao thành công</h1>
      <p style="color: #555; font-size: 16px;">Xin chào ${userName},</p>
      <p style="color: #555; font-size: 16px;">
        Đơn hàng của bạn với mã <strong>${orderId}</strong> đã được giao thành công!
      </p>
      <p style="color: #555; font-size: 16px;">Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</p>
    </div>
  `,

  priceDealSuccess: (driverName, orderId) => `
    <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px; text-align: center;">
      <h1 style="color: #333; font-size: 24px;">Thông báo deal giá thành công</h1>
      <p style="color: #555; font-size: 16px;">Xin chào ${driverName},</p>
      <p style="color: #555; font-size: 16px;">
        Bạn đã thành công trong việc deal giá cho đơn hàng với mã <strong>${orderId}</strong>!
      </p>
      <p style="color: #555; font-size: 16px;">Vui lòng chuẩn bị để nhận hàng.</p>
    </div>
  `,

  driverOrderCancelled: (driverName, orderId) => `
    <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px; text-align: center;">
      <h1 style="color: #333; font-size: 24px;">Thông báo hủy đơn hàng</h1>
      <p style="color: #555; font-size: 16px;">Xin chào tài xế${driverName},</p>
      <p style="color: #555; font-size: 16px;">
        Bạn đã hủy đơn hàng với mã <strong>${orderId}</strong>.Bạn đã bị trừ phí hủy đơn hàng (10% trên giá trị vận chuyển).
      </p>
      <p>Nếu có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua email: 
        <a href="mailto:RFTMS@gmail.com" style="color: #28a745; text-decoration: underline;">RFTMS@gmail.com</a>
      </p>
      <p style="color: #555; font-size: 16px;">Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</p>
    </div>
  `,

  userOrderCancelled: (userName, orderId) => `
    <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px; text-align: center;">
      <h1 style="color: #333; font-size: 24px;">Thông báo hủy đơn hàng</h1>
      <p style="color: #555; font-size: 16px;">Xin chào ${userName},</p>
      <p style="color: #555; font-size: 16px;">
        Đơn hàng của bạn với mã <strong>${orderId}</strong> đã được hủy thành công. Bạn đã bị trừ phí hủy đơn hàng (10% trên giá trị vận chuyển).
      </p>
      <p>Nếu có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua email: 
        <a href="mailto:RFTMS@gmail.com" style="color: #28a745; text-decoration: underline;">RFTMS@gmail.com</a>
      </p>
      <p style="color: #555; font-size: 16px;">Nếu bạn không thực hiện thay đổi này, vui lòng liên hệ với chúng tôi ngay.</p>
    </div>
  `,
  otpVerification: (otpCode) => `
  <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px; text-align: center;">
    <h1 style="color: #333; font-size: 24px;">Mã xác thực OTP</h1>
    <p style="color: #555; font-size: 16px;">
      Mã OTP của bạn là: <strong>${otpCode}</strong>. Mã này có hiệu lực trong 5 phút.
    </p>
  </div>
`,
};

module.exports = emailTemplates;
