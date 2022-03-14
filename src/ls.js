export default {
  get: (key) => {
    try {
      return JSON.parse(localStorage.getItem(LS_PREFIX + key));
    } catch (e) {
      return null;
    }
  },
  set: (key, value) => {
    try {
      if (value) {
        localStorage.setItem(LS_PREFIX + key, JSON.stringify(value));
      } else {
        localStorage.removeItem(LS_PREFIX + key);
      }
    } catch (e) {
      // ignore
    }
  },
  del: (key) => {
    try {
      localStorage.removeItem(LS_PREFIX + key);
    } catch (e) {
      // ignore
    }
  },
};
