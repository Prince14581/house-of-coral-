// utils/asyncWrapper.js
// This ensures that any error in a route is safely caught
const asyncWrapper = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

module.exports = asyncWrapper;
