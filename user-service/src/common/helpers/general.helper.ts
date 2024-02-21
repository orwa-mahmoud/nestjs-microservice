export const pick = <T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
  return keys.reduce((result, key) => {
    if (obj.hasOwnProperty(key)) {
      result[key] = obj[key];
    }
    return result;
  }, {} as Pick<T, K>);
};
