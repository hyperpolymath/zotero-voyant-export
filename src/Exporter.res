// Exporter module - Handle collection export to Voyant format

// Get temporary directory using FileUtils
let getTmpDir = (): Firefox.nsIFile => {
  let fileUtils = Firefox.FileUtils.get()
  let tmpDir = fileUtils->Firefox.FileUtils.getFile("TmpD", ["collection"])
  tmpDir.createUnique(Firefox.nsIFile_DIRECTORY_TYPE, 0o755)
  tmpDir
}

// Create subdirectory
let mkdir = (startDir: Firefox.nsIFile, dirName: string): Firefox.nsIFile => {
  let newDir = startDir.clone()
  newDir.append(dirName)
  newDir.create(Firefox.nsIFile_DIRECTORY_TYPE, 0o755)
  newDir
}

// Get file reference in directory
let fileInDir = (startDir: Firefox.nsIFile, fileName: string): Firefox.nsIFile => {
  let newFile = startDir.clone()
  newFile.append(fileName)
  newFile
}

// Copy file to directory with new name
let copyFileTo = (sourceFile: Firefox.nsIFile, targetDir: Firefox.nsIFile, newName: string): unit => {
  sourceFile.copyTo(targetDir, newName)
}

// Process a single item
let processItem = async (item: Zotero.item, dataDir: Firefox.nsIFile): unit => {
  Zotero.debug(`Processing item ${Belt.Int.toString(item.id)}`)

  try {
    let attResult = await item.getBestAttachment()

    switch attResult->Js.Nullable.toOption {
    | None => Zotero.debug(`No attachment for item ${Belt.Int.toString(item.id)}`)
    | Some(att) => {
        let pathResult = await att.getFilePathAsync()

        switch pathResult->Js.Nullable.toOption {
        | None =>
          Zotero.debug(`No file path for attachment on item ${Belt.Int.toString(item.id)}`)
        | Some(attPath) => {
            let attFile = Zotero.File.pathToFile(attPath)
            let itemID = Belt.Int.toString(item.id)

            Zotero.debug(`Saving item ${itemID}`)

            let itemOutDir = mkdir(dataDir, itemID)

            // Generate metadata
            let mods = Format.generateMODS(item)
            let dc = Format.generateDC(item)

            let modsFile = fileInDir(itemOutDir, "MODS.bin")
            let dcFile = fileInDir(itemOutDir, "DC.xml")

            Zotero.File.putContents(modsFile, mods)
            Zotero.File.putContents(dcFile, dc)

            // Copy attachment
            copyFileTo(attFile, itemOutDir, "CWRC.bin")
          }
        }
      }
    }
  } catch {
  | exn =>
    Zotero.debug(
      `Error processing item ${Belt.Int.toString(item.id)}: ${exn->Obj.magic}`,
    )
  }
}

// Export collection to Voyant format
let doExport = async (): unit => {
  Zotero.debug("[Voyant Export] Starting export")

  switch Zotero.getZoteroPane() {
  | None => Zotero.debug("[Voyant Export] Could not get Zotero pane")
  | Some(pane) => {
      let collectionResult = pane.getSelectedCollection()

      switch collectionResult->Js.Nullable.toOption {
      | None => Zotero.debug("[Voyant Export] No collection selected")
      | Some(collection) => {
          let name = collection.name
          let items = collection.getChildItems()

          Zotero.debug(
            `[Voyant Export] Collection: ${name}, ${Belt.Int.toString(items->Array.length)} items`,
          )

          // Show file picker
          let outFile = UI.showFilePicker(name)

          switch outFile->Js.Nullable.toOption {
          | None => Zotero.debug("[Voyant Export] Export cancelled")
          | Some(file) => {
              let outDir = getTmpDir()
              Zotero.debug(`[Voyant Export] Using tmp dir: ${outDir.path}`)

              // Create bagit.txt
              let bagitFile = fileInDir(outDir, "bagit.txt")
              Zotero.File.putContents(bagitFile, "")

              // Create data directory
              let dataDir = mkdir(outDir, "data")

              // Process all items
              for i in 0 to items->Array.length - 1 {
                await processItem(items[i], dataDir)
              }

              // Zip the directory
              await Zotero.File.zipDirectory(outDir.path, file.path)

              Zotero.debug(`[Voyant Export] Export complete: ${file.path}`)
            }
          }
        }
      }
    }
  }
}
