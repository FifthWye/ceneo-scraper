function producer(urls) {
  let arr = [];
  urls.map(url => {
    let obj = { data: {} };
    obj.data.url = url;
    arr.push(obj);
  });
  return arr;
}

function getArgsArr(arr) {
  let args = [];

  for (let i = 2; i < arr.length; i++) {
    args.push(arr[i]);
  }
  return args;
}

function getMaxObjAttributeInArr(attr, arr) {
  return Math.max.apply(
    Math,
    arr.map(function(o) {
      return o[attr];
    })
  );
}

function getMinObjAttributeInArr(attr, arr) {
  return Math.min.apply(
    Math,
    arr.map(function(o) {
      return o[attr];
    })
  );
}

module.exports = {
  getMaxObjAttributeInArr: getMaxObjAttributeInArr,
  getMinObjAttributeInArr: getMinObjAttributeInArr,
  getArgsArr: getArgsArr,
  producer: producer
};
