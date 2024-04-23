# cfplist

`cfplist` is a streamlined package designed for parsing and building Apple's Property Lists (.plist files) specifically for Cloudflare Worker environments. While there are several libraries available for handling the conversion between Apple's Property List (.plist) format and JSON, many are not compatible with the unique runtime environment provided by Cloudflare Workers. `cfplist` bridges this gap, offering a lightweight solution that integrates smoothly with Cloudflare Worker services. Contributions to further improve and refine `cfplist` are warmly welcomed.

## Features

- **Lightweight**: Minimally impacts your Cloudflare Worker's performance.
- **Compatible**: Designed to work seamlessly within the Cloudflare Worker environment.
- **Easy to Use**: Simple API for parsing and building plist files.

## Installation

To install `cfplist`, run the following command in your terminal:

```bash
npm install cfplist
```

## Usage

First, require the `cfplist` module in your project:

```javascript
const plist = require('cfplist');
```

### Parsing a plist String

To convert a plist XML string into a JSON object, use the `parse()` method:

```javascript
const plistObj = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
<key>name</key>
<string>cfplist</string>
</dict>
</plist>`;

const jsonObj = plist.parse(plistObj);
console.log(jsonObj); // Outputs: {"name":"cfplist"}
```

### Building a plist String

To create a plist XML string from a JSON object, use the `build()` method:

```javascript
const jsonObj = {
    name: 'cfplist',
    version: '1.0.0'
};

const plistObj = plist.build(jsonObj);
console.log(plistObj);
// Outputs the plist XML string
```

## API Reference

- `plist.parse(plistString)`: Converts a plist XML string into a JSON object.
- `plist.build(jsonObject)`: Converts a JSON object into a plist XML string.

## Contributing

Contributions to `cfplist` are greatly appreciated. Whether it's through submitting bug reports, suggesting enhancements, or adding new features, your input helps make `cfplist` better for everyone. Please feel free to submit issues or pull requests on our GitHub repository.

## License

`cfplist` is made available under the MIT License. For more details, see the [LICENSE](LICENSE) file.

---

This revision aims to provide a more structured and informative README that clearly communicates the purpose, usage, and contribution guidelines for `cfplist`. Feel free to adjust it further to better fit your project's needs.