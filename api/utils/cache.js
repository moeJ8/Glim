
// I'm not using this for now, but I'm keeping it here for future reference

import NodeCache from 'node-cache';

//Time To Live of 1 hour
const cache = new NodeCache({stdTTL: 3600});

//Get data from cache
export const getCache = (key) => { 
    return cache.get(key);
}

//set data in cache
export const setCache = (key, value, ttl = 3600) => {
    return cache.set(key, value, ttl);
}

//delete data from cache
export const deleteCache = (key) => {
    return cache.del(key);
}

//clear all cache
export const clearAllCache = () => {
    return cache.flushAll();
}
