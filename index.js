const plist = (() => {
  const DataType = {
    String: "string",
    Number: "number",
    Boolean: "boolean",
    Object: "object",
    Real: "real",
    Integer: "integer",
    Dict: "dict",
    Array: "array",
    True: "true",
    False: "false",
  }, build = (object, isRootDict = true) =>{
    if (typeof object !== "object") {
      throw new Error("Built data must be an object");
    }
    const append = (key, value, isRoot = false) => {
      let result = "";
      if (key && !isRoot) result += `<key>${key}</key>\n`;
  
      switch (typeof value) {
        case DataType.String:
          return result + `<string>${value}</string>\n`;
        case DataType.Number:
          return result + (Number.isInteger(value) ? `<integer>${value}</integer>\n` : `<real>${value}</real>\n`);
        case DataType.Boolean:
          return result + (value ? `<true/>\n` : `<false/>\n`);
        case DataType.Object:
          if (Array.isArray(value)) {
            return result + `<array>\n${value.map((item) => append(null, item, true)).join("")}</array>\n`;
          } else if (value === null) {
            return result + `<string>${value}</string>\n`; // Considering null as a string for plist purpose
          } else {
            let dictItems = "";
            for (const [dictKey, dictValue] of Object.entries(value)) {
              dictItems += append(dictKey, dictValue);
            }
            return result + `<dict>\n${dictItems}</dict>\n`;
          }
        default:
          return "";
      }
    };
  
    const plistHeader = `<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n<plist version="1.0">\n`;
    const plistFooter = `</plist>`;
  
    let plistBody = "";
    if (isRootDict && typeof object === DataType.Object && !Array.isArray(object)) {
      plistBody += "<dict>\n";
      for (const [key, value] of Object.entries(object)) {
        plistBody += append(key, value);
      }
      plistBody += "</dict>\n";
    } else if (Array.isArray(object)) {
      plistBody += "<array>\n";
      object.forEach((item) => {
        plistBody += append(null, item, true);
      });
      plistBody += "</array>\n";
    } else {
      plistBody += append(null, object, true);
    }
  
    return plistHeader + plistBody + plistFooter;
  },
  parse = (xmlString) => {
    xmlString = xmlString.replace(/<\!--.*-->/g, '')
    const regex = /(<(dict|array)>((.|\s)+)(<\/dict>|<\/array>))[\s\n]*(|<\/plist>)$/,
      match = regex.exec(xmlString),
      numOccurrences = (reg, text) => {
        let matches = text.match(reg);
        return matches ? matches.length : 0;
      },
      parser = (keyval) => {
        let regexKeyVal = /^<key>([^>]+)<\/key><(\w+)>(.+)<\/(\w+)>$/,
          regexVal = /^<(\w+)>(.+)<\/(\w+)>$/,
          regexKeyBooleanNull = /^<key>([^>]+)<\/key><(\w+)\/>$/,
          matchingKeyVal = regexKeyVal.exec(keyval),
          matchingVal = regexVal.exec(keyval),
          matchingKeyBooleanNull = regexKeyBooleanNull.exec(keyval),
          keyName,
          valueType,
          value,
          endValueType,
          tempJSON = {},
          tempArray = [];
        if (matchingKeyVal) {
          keyName = matchingKeyVal[1];
          valueType = matchingKeyVal[2];
          value = matchingKeyVal[3];
  
          switch (valueType) {
            case DataType.Real:
              tempJSON[keyName] = parseFloat(value);
              break;
            case DataType.Integer:
              tempJSON[keyName] = parseInt(value);
              break;
            case DataType.Dict:
            case DataType.Array:
              tempJSON[keyName] = parse(`<${valueType}>${value}</${valueType}>`);
              break;
            default:
              tempJSON[keyName] = value;
              break;
          }
          return tempJSON;
        } else if (matchingKeyBooleanNull) {
          keyName = matchingKeyBooleanNull[1];
          valueType = matchingKeyBooleanNull[2];
          switch (valueType) {
            case DataType.True:
            case DataType.False:
              value = valueType === "true";
              break;
            case DataType.Array:
              value = [];
              break;
            case DataType.Dict:
              value = {};
              break;
            case DataType.Real:
            case DataType.Integer:
              value = 0;
              break;
            default:
              value = "";
              break;
          }
          tempJSON[keyName] = value;
          return tempJSON;
        } else if (matchingVal) {
          valueType = matchingVal[1];
          endValueType = matchingVal[3];
          value = matchingVal[2];
          switch (valueType) {
            case DataType.Integer:
              value = parseInt(value);
              break;
            case DataType.Real:
              value = parseFloat(value);
              break;
            case DataType.Dict:
            case DataType.Array:
              value = parse(`<${valueType}>${value}</${valueType}>`);
              break;
          }
          tempArray.push(value);
          return tempArray;
        } else {
          return null;
        }
      };
    if (!match) return null;
    let isRootAnArray = match[2] === "array" ? true : false,
      adjustedPayload = [];
    let payload = match[3]
      .replace(/(^\s+|\s+$|\n+)/gm, "")
      .replace(/(<(\/\w+|(\w+)\/)>)/g, "$1\n")
      .replace(/(<\/key>)(\n|\s)*/g, "$1")
      .replace(/(\n|\s)*(<\/dict>|<\/array>)/g, "$2");
  
    payload = payload.split("\n");
    for (let i = 0; i < payload.length; i++) {
      if (!payload[i].trim()) break;
      const dictOpenOcc = numOccurrences(/<dict>/g, payload[i]),
        dictCloseOcc = numOccurrences(/<\/dict>/g, payload[i]),
        arrayOpenOcc = numOccurrences(/<array>/g, payload[i]),
        arrayCloseOcc = numOccurrences(/<\/array>/g, payload[i]);
      if (dictOpenOcc == dictCloseOcc && arrayOpenOcc == arrayCloseOcc) {
        adjustedPayload.push(payload[i]);
      } else {
        payload[i + 1] = payload[i] + payload[i + 1];
      }
    }
    let resultArray = [],
      resultJSON = {};
    adjustedPayload.forEach((item) => {
      if (isRootAnArray) {
        resultArray = resultArray.concat(parser(item.trim()));
      } else {
        resultJSON = { ...resultJSON, ...parser(item.trim()) };
      }
    });
    return isRootAnArray ? resultArray : resultJSON;
  }
  return {parse, build}
  })();
  
  
  module.exports = plist