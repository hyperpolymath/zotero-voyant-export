/**
 * Format.res - Metadata Generation (ReScript)
 * Replaces lib/format.js with type-safe ReScript code
 *
 * This module generates MODS and Dublin Core XML metadata
 * with optional WASM acceleration for performance
 */

// Type definitions for Zotero items
type creator = {
  firstName: option<string>,
  lastName: string,
  creatorType: string,
}

type tag = {tag: string}

type zoteroItem = {
  getDisplayTitle: unit => string,
  getCreators: unit => array<creator>,
  getTags: unit => option<array<tag>>,
  libraryKey: string,
  itemType: option<string>,
  date: option<string>,
  abstractNote: option<string>,
  publisher: option<string>,
  language: option<string>,
  rights: option<string>,
}

// Constants
let xmlDeclaration = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"

let modsNs = "http://www.loc.gov/mods/v3"

let modsRootElement = `<mods xmlns="http://www.loc.gov/mods/v3" xmlns:mods="http://www.loc.gov/mods/v3" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xlink="http://www.w3.org/1999/xlink" xsi:schemaLocation="http://www.loc.gov/mods/v3 http://www.loc.gov/standards/mods/mods.xsd" />`

let dcNs = "http://purl.org/dc/elements/1.1/"

let dcRootElement = `<oai_dc:dc xmlns:oai_dc="http://www.openarchives.org/OAI/2.0/oai_dc/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.openarchives.org/OAI/2.0/oai_dc/ http://www.openarchives.org/OAI/2.0/oai_dc.xsd" />`

// Item type mapping for Dublin Core
let itemTypeMap = %raw(`{
  'book': 'Text',
  'journalArticle': 'Text',
  'conferencePaper': 'Text',
  'thesis': 'Text',
  'webpage': 'InteractiveResource',
  'film': 'MovingImage',
  'audioRecording': 'Sound',
  'artwork': 'Image'
}`)

/**
 * XML escaping for security
 * Prevents XML injection attacks
 */
let escapeXml = (text: string): string => {
  text
  ->String.replaceAll("<", "&lt;")
  ->String.replaceAll(">", "&gt;")
  ->String.replaceAll("&", "&amp;")
  ->String.replaceAll("\"", "&quot;")
  ->String.replaceAll("'", "&apos;")
}

/**
 * Create full name from creator
 */
let creatorToFullName = (creator: creator): string => {
  switch creator.firstName {
  | Some(first) => `${first} ${creator.lastName}`
  | None => creator.lastName
  }
}

// FFI bindings for Firefox XPCOM
@module("chrome")
external chrome: {..} = "Cc"

// External binding for WASM module (if available)
type wasmModule = {
  generateMODS: string => Promise.t<Result.t<string, string>>,
  generateDC: string => Promise.t<Result.t<string, string>>,
}

@val @scope("globalThis")
external wasmModule: option<wasmModule> = "metadataWasm"

/**
 * Generate MODS XML using WASM if available, fallback to JavaScript
 */
let generateMODSWasm = async (item: zoteroItem): Result.t<string, string> => {
  // Convert item to JSON for WASM
  let itemJson = %raw(`JSON.stringify(item)`)

  switch wasmModule {
  | Some(wasm) =>
    try {
      await wasm.generateMODS(itemJson)
    } catch {
    | _ => Error("WASM MODS generation failed")
    }
  | None =>
    // Fallback to JavaScript implementation
    generateMODSJs(item)
  }
}

/**
 * Generate MODS XML (JavaScript implementation)
 * This is the fallback when WASM is not available
 */
and generateMODSJs = (item: zoteroItem): Result.t<string, string> => {
  try {
    let title = item.getDisplayTitle()
    let creators = item.getCreators()

    // Build XML manually (simplified version)
    let xml = [xmlDeclaration]
    xml->Array.push(`<mods xmlns="${modsNs}">`)

    // Title
    if title != "" {
      xml->Array.push(`  <titleInfo><title>${escapeXml(title)}</title></titleInfo>`)
    }

    // Creators
    creators->Array.forEach(creator => {
      let fullName = creatorToFullName(creator)
      xml->Array.push(`  <name type="personal">`)
      xml->Array.push(`    <namePart>${escapeXml(fullName)}</namePart>`)

      if creator.creatorType != "" {
        xml->Array.push(`    <role>`)
        xml->Array.push(
          `      <roleTerm type="text">${escapeXml(creator.creatorType)}</roleTerm>`,
        )
        xml->Array.push(`    </role>`)
      }

      xml->Array.push(`  </name>`)
    })

    // Date
    switch item.date {
    | Some(date) =>
      xml->Array.push(`  <originInfo>`)
      xml->Array.push(`    <dateIssued>${escapeXml(date)}</dateIssued>`)
      xml->Array.push(`  </originInfo>`)
    | None => ()
    }

    // Abstract
    switch item.abstractNote {
    | Some(abstract) => xml->Array.push(`  <abstract>${escapeXml(abstract)}</abstract>`)
    | None => ()
    }

    // Type
    switch item.itemType {
    | Some(itemType) =>
      xml->Array.push(`  <typeOfResource>${escapeXml(itemType)}</typeOfResource>`)
    | None => ()
    }

    xml->Array.push(`</mods>`)

    Ok(xml->Array.join("\n"))
  } catch {
  | exn => Error(`MODS generation failed: ${exn->Exception.message->Option.getOr("Unknown error")}`)
  }
}

/**
 * Generate Dublin Core XML
 */
let generateDC = async (item: zoteroItem): Result.t<string, string> => {
  try {
    let title = item.getDisplayTitle()
    let creators = item.getCreators()

    // Build XML
    let xml = [dcRootElement->String.replace("/>", ">")]

    // Identifier (required)
    xml->Array.push(`  <dc:identifier>${escapeXml(item.libraryKey)}</dc:identifier>`)

    // Title
    if title != "" {
      xml->Array.push(`  <dc:title>${escapeXml(title)}</dc:title>`)
    }

    // Creators
    creators->Array.forEach(creator => {
      let fullName = creatorToFullName(creator)
      let elementName = switch creator.creatorType {
      | "author" | "creator" => "dc:creator"
      | _ => "dc:contributor"
      }
      xml->Array.push(`  <${elementName}>${escapeXml(fullName)}</${elementName}>`)
    })

    // Date
    switch item.date {
    | Some(date) => xml->Array.push(`  <dc:date>${escapeXml(date)}</dc:date>`)
    | None => ()
    }

    // Description
    switch item.abstractNote {
    | Some(abstract) => xml->Array.push(`  <dc:description>${escapeXml(abstract)}</dc:description>`)
    | None => ()
    }

    // Type
    switch item.itemType {
    | Some(itemType) =>
      let dcType = %raw(`itemTypeMap[itemType] || 'Text'`)
      xml->Array.push(`  <dc:type>${escapeXml(dcType)}</dc:type>`)
    | None => ()
    }

    // Publisher
    switch item.publisher {
    | Some(pub) => xml->Array.push(`  <dc:publisher>${escapeXml(pub)}</dc:publisher>`)
    | None => ()
    }

    // Language
    switch item.language {
    | Some(lang) => xml->Array.push(`  <dc:language>${escapeXml(lang)}</dc:language>`)
    | None => ()
    }

    // Tags as subjects
    switch item.getTags() {
    | Some(tags) =>
      tags->Array.forEach(tag => {
        xml->Array.push(`  <dc:subject>${escapeXml(tag.tag)}</dc:subject>`)
      })
    | None => ()
    }

    // Rights
    switch item.rights {
    | Some(rights) => xml->Array.push(`  <dc:rights>${escapeXml(rights)}</dc:rights>`)
    | None => ()
    }

    xml->Array.push(`</oai_dc:dc>`)

    Ok(xml->Array.join("\n"))
  } catch {
  | exn => Error(`DC generation failed: ${exn->Exception.message->Option.getOr("Unknown error")}`)
  }
}

/**
 * Public API - uses WASM when available
 */
let generateMODS = async (item: zoteroItem): Result.t<string, string> => {
  await generateMODSWasm(item)
}

// Export for JavaScript interop
let make = () => {
  "generateMODS": generateMODS,
  "generateDC": generateDC,
}
