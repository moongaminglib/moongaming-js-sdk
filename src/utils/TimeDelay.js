const TimeDelay = time => new Promise((resolve) => {
  setTimeout(resolve, time || 1000);
});
export default TimeDelay;
