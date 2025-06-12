const fileList = [
  { name: "style.css", url: "style.css" },
  { name: "sample.jpg", url: "sample.jpg" },
  { name: "script.js", url: "script.js" },
  { name: "font.ttf", url: "font.ttf" },
];

document.getElementById("saveBtn").onclick = saveFiles;

function saveFiles() {
  if (!navigator.storage?.getDirectory) {
    alert("Your browser does not support Origin Private File System (OPFS).");
    return;
  }

  navigator.storage.getDirectory().then((dir) => {
    fileList.forEach((file) => {
      fetch(file.url)
        .then((res) => res.blob())
        .then((blob) => {
          dir
            .getFileHandle(file.name, { create: true })
            .then((handle) => handle.createWritable())
            .then((writable) =>
              writable.write(blob).then(() => writable.close())
            );
        });
    });

    alert("Files saved for offline use! Reload page to see offline content.");
  });
}

function loadAllFilesFromStorage() {
  if (!navigator.storage?.getDirectory) {
    console.log("OPFS not supported, skipping offline load.");
    return;
  }

  navigator.storage.getDirectory().then((dir) => {
    fileList.forEach((file) => {
      dir
        .getFileHandle(file.name)
        .then((handle) => {
          return handle.getFile();
        })
        .then((f) => {
          const url = URL.createObjectURL(f);

          if (file.name.match(/\.(jpg|png|webp)$/)) {
            document.getElementById("logo").src = url;
          } else if (file.name.endsWith(".css")) {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = url;
            document.head.appendChild(link);
          } else if (file.name.endsWith(".js")) {
            const script = document.createElement("script");
            script.src = url;
            document.body.appendChild(script);
          } else if (file.name.match(/\.(woff2|woff|ttf)$/)) {
            const fontName = file.name.split(".")[0];
            const format = file.name.endsWith(".ttf")
              ? "truetype"
              : file.name.endsWith(".woff")
              ? "woff"
              : "woff2";

            const style = document.createElement("style");
            style.textContent = `
            @font-face {
              font-family: '${fontName}';
              src: url('${url}') format('${format}');
            }
            body {
              font-family: '${fontName}', sans-serif;
            }
          `;
            document.head.appendChild(style);
          }
        })
        .catch(() => {
          console.log(`${file.name} not found in storage.`);
        });
    });
  });
}

// Load saved files on page load
loadAllFilesFromStorage();

// Register basic service worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("sw.js")
    .then(() => console.log("Service Worker registered"))
    .catch((e) => console.error("Service Worker registration failed:", e));
}
