const User = require('../models/User');

// ✅ Reusable SweetAlert Page
const sweetAlert = (icon, title, text, redirect = '/auth/login') => `
<!DOCTYPE html>
<html><head><script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script></head>
<body>
  <script>
    Swal.fire({ icon: '${icon}', title: '${title}', text: '${text}' })
    .then(() => window.location.href = '${redirect}');
  </script>
</body></html>
`;

// ✅ Middleware: Is Logged In
exports.isLoggedIn = (req, res, next) => {
  if (req.session.user) return next();
  return res.redirect('/auth/login');
};

// ✅ Middleware: Is Admin
exports.isAdmin = (req, res, next) => {
  if (req.session.user?.isAdmin) return next();
  return res.redirect('/auth/login');
};

// ✅ Middleware: Is User (non-admin, not suspended)
exports.isUser = async (req, res, next) => {
  try {
    if (!req.session.user) return res.redirect('/auth/login');

    const user = await User.findById(req.session.user.id);

    if (!user || user.isSuspended) {
      req.session.destroy(() => {
        return res.send(sweetAlert('warning', 'Suspended!', 'Your account has been suspended.'));
      });
    } else {
      next();
    }
  } catch (err) {
    console.error('[Middleware Error - isUser]', err);
    res.redirect('/auth/login');
  }
};


