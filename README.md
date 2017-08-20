# unicode-widget

Structure of IPC messages

| ---- | ---- |
| `type` | `status`, `result` |
| `ready` | `true`, `false` |
| `message` | message |
| `result` | result of search |

## How to run

```
npm install
npm start
```

## How to build

### Install `electron-packager`
```
npm install electron-packager -g
```


### Windows
```
electron-packager . --overwrite --asar=true --platform=win32 --arch=ia32 --icon=assets/icons/win/icon.ico --prune=true --out=release-builds --version-string.CompanyName=Kore --version-string.FileDescription=Kore --version-string.ProductName="Unicode Widget"
```

### macOS
```
electron-packager . --overwrite --platform=darwin --arch=x64 --icon=assets/icons/mac/icon.icns --prune=true --out=release-builds
```

### Linux
```
electron-packager . --overwrite --platform=linux --arch=x64 --icon=assets/icons/png/1024x1024.png --prune=true --out=release-builds
```
