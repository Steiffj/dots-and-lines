onmessage = async (e) => {
  const message = e.data;
  console.log(`Received message: ${message}`);

  const root = await navigator.storage.getDirectory();
  const workDir = await root.getDirectoryHandle("work", { create: true });
  const draftHandle = await workDir.getFileHandle("draft.txt", {
    create: true,
  });

  const accessHandle = await draftHandle.createSyncAccessHandle();

  const fileSize = accessHandle.getSize();
  // console.log(`file size: ${fileSize}`);

  const buffer = new DataView(new ArrayBuffer(fileSize));
  const readBuffer = accessHandle.read(buffer, { at: 0 });

  const encoder = new TextEncoder();
  const encodedMessage = encoder.encode(message);
  const writeBuffer = accessHandle.write(encodedMessage, { at: readBuffer });

  accessHandle.flush();
  accessHandle.close();

  postMessage(`Write buffer size: ${writeBuffer}`);
};
