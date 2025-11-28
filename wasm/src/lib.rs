/*!
 * Metadata WASM Module
 * Fast XML metadata generation for Zotero Voyant Export
 *
 * This WASM module provides high-performance XML generation for:
 * - MODS (Metadata Object Description Schema)
 * - Dublin Core metadata
 *
 * Written in Rust for memory safety and performance
 */

use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
use quick_xml::Writer;
use std::io::Cursor;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator for smaller WASM binary size
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

/// Console logging for debugging
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

/// Creator (author, contributor, etc.)
#[derive(Deserialize, Serialize, Debug)]
#[serde(rename_all = "camelCase")]
struct Creator {
    first_name: Option<String>,
    last_name: String,
    creator_type: String,
}

impl Creator {
    fn full_name(&self) -> String {
        match &self.first_name {
            Some(first) => format!("{} {}", first, self.last_name),
            None => self.last_name.clone(),
        }
    }
}

/// Tag/subject
#[derive(Deserialize, Serialize, Debug)]
struct Tag {
    tag: String,
}

/// Zotero item (subset of fields for XML generation)
#[derive(Deserialize, Serialize, Debug)]
#[serde(rename_all = "camelCase")]
struct ZoteroItem {
    library_key: String,
    title: Option<String>,
    creators: Option<Vec<Creator>>,
    date: Option<String>,
    abstract_note: Option<String>,
    item_type: Option<String>,
    publisher: Option<String>,
    language: Option<String>,
    rights: Option<String>,
    tags: Option<Vec<Tag>>,
}

/// XML escape function - prevents injection attacks
fn escape_xml(input: &str) -> String {
    input
        .replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
        .replace('\'', "&apos;")
}

/// Generate MODS XML from Zotero item
#[wasm_bindgen]
pub fn generate_mods(item_json: &str) -> Result<String, JsValue> {
    let item: ZoteroItem = serde_json::from_str(item_json)
        .map_err(|e| JsValue::from_str(&format!("JSON parse error: {}", e)))?;

    let mut xml = Vec::new();

    // XML declaration
    xml.push("<?xml version=\"1.0\" encoding=\"UTF-8\"?>".to_string());

    // MODS root element
    xml.push("<mods xmlns=\"http://www.loc.gov/mods/v3\" xmlns:mods=\"http://www.loc.gov/mods/v3\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xsi:schemaLocation=\"http://www.loc.gov/mods/v3 http://www.loc.gov/standards/mods/mods.xsd\">".to_string());

    // Title
    if let Some(title) = &item.title {
        xml.push(format!(
            "  <titleInfo><title>{}</title></titleInfo>",
            escape_xml(title)
        ));
    }

    // Creators
    if let Some(creators) = &item.creators {
        for creator in creators {
            xml.push("  <name type=\"personal\">".to_string());
            xml.push(format!(
                "    <namePart>{}</namePart>",
                escape_xml(&creator.full_name())
            ));

            if !creator.creator_type.is_empty() {
                xml.push("    <role>".to_string());
                xml.push(format!(
                    "      <roleTerm type=\"text\">{}</roleTerm>",
                    escape_xml(&creator.creator_type)
                ));
                xml.push("    </role>".to_string());
            }

            xml.push("  </name>".to_string());
        }
    }

    // Date
    if let Some(date) = &item.date {
        xml.push("  <originInfo>".to_string());
        xml.push(format!("    <dateIssued>{}</dateIssued>", escape_xml(date)));
        xml.push("  </originInfo>".to_string());
    }

    // Abstract
    if let Some(abstract_note) = &item.abstract_note {
        xml.push(format!("  <abstract>{}</abstract>", escape_xml(abstract_note)));
    }

    // Type of resource
    if let Some(item_type) = &item.item_type {
        xml.push(format!(
            "  <typeOfResource>{}</typeOfResource>",
            escape_xml(item_type)
        ));
    }

    xml.push("</mods>".to_string());

    Ok(xml.join("\n"))
}

/// Generate Dublin Core XML from Zotero item
#[wasm_bindgen]
pub fn generate_dc(item_json: &str) -> Result<String, JsValue> {
    let item: ZoteroItem = serde_json::from_str(item_json)
        .map_err(|e| JsValue::from_str(&format!("JSON parse error: {}", e)))?;

    let mut xml = Vec::new();

    // DC root element
    xml.push("<oai_dc:dc xmlns:oai_dc=\"http://www.openarchives.org/OAI/2.0/oai_dc/\" xmlns:dc=\"http://purl.org/dc/elements/1.1/\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"http://www.openarchives.org/OAI/2.0/oai_dc/ http://www.openarchives.org/OAI/2.0/oai_dc.xsd\">".to_string());

    // Identifier (required)
    xml.push(format!(
        "  <dc:identifier>{}</dc:identifier>",
        escape_xml(&item.library_key)
    ));

    // Title
    if let Some(title) = &item.title {
        xml.push(format!("  <dc:title>{}</dc:title>", escape_xml(title)));
    }

    // Creators
    if let Some(creators) = &item.creators {
        for creator in creators {
            let element_name = match creator.creator_type.as_str() {
                "author" | "creator" => "dc:creator",
                _ => "dc:contributor",
            };
            xml.push(format!(
                "  <{0}>{1}</{0}>",
                element_name,
                escape_xml(&creator.full_name())
            ));
        }
    }

    // Date
    if let Some(date) = &item.date {
        xml.push(format!("  <dc:date>{}</dc:date>", escape_xml(date)));
    }

    // Description (abstract)
    if let Some(abstract_note) = &item.abstract_note {
        xml.push(format!(
            "  <dc:description>{}</dc:description>",
            escape_xml(abstract_note)
        ));
    }

    // Type
    if let Some(item_type) = &item.item_type {
        let dc_type = match item_type.as_str() {
            "book" | "journalArticle" | "conferencePaper" | "thesis" => "Text",
            "webpage" => "InteractiveResource",
            "film" => "MovingImage",
            "audioRecording" => "Sound",
            "artwork" => "Image",
            _ => "Text",
        };
        xml.push(format!("  <dc:type>{}</dc:type>", dc_type));
    }

    // Publisher
    if let Some(publisher) = &item.publisher {
        xml.push(format!(
            "  <dc:publisher>{}</dc:publisher>",
            escape_xml(publisher)
        ));
    }

    // Language
    if let Some(language) = &item.language {
        xml.push(format!(
            "  <dc:language>{}</dc:language>",
            escape_xml(language)
        ));
    }

    // Tags as subjects
    if let Some(tags) = &item.tags {
        for tag in tags {
            xml.push(format!("  <dc:subject>{}</dc:subject>", escape_xml(&tag.tag)));
        }
    }

    // Rights
    if let Some(rights) = &item.rights {
        xml.push(format!("  <dc:rights>{}</dc:rights>", escape_xml(rights)));
    }

    xml.push("</oai_dc:dc>".to_string());

    Ok(xml.join("\n"))
}

/// Module initialization
#[wasm_bindgen(start)]
pub fn main() {
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();

    log("Metadata WASM module initialized");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_escape_xml() {
        assert_eq!(escape_xml("Test & <tag>"), "Test &amp; &lt;tag&gt;");
        assert_eq!(escape_xml("Quote \" test"), "Quote &quot; test");
    }

    #[test]
    fn test_generate_mods() {
        let json = r#"{
            "libraryKey": "ABC123",
            "title": "Test Article",
            "creators": [
                {
                    "firstName": "John",
                    "lastName": "Doe",
                    "creatorType": "author"
                }
            ],
            "date": "2024-01-01"
        }"#;

        let result = generate_mods(json);
        assert!(result.is_ok());

        let xml = result.unwrap();
        assert!(xml.contains("<title>Test Article</title>"));
        assert!(xml.contains("<namePart>John Doe</namePart>"));
        assert!(xml.contains("<dateIssued>2024-01-01</dateIssued>"));
    }

    #[test]
    fn test_generate_dc() {
        let json = r#"{
            "libraryKey": "ABC123",
            "title": "Test Book",
            "itemType": "book"
        }"#;

        let result = generate_dc(json);
        assert!(result.is_ok());

        let xml = result.unwrap();
        assert!(xml.contains("<dc:identifier>ABC123</dc:identifier>"));
        assert!(xml.contains("<dc:title>Test Book</dc:title>"));
        assert!(xml.contains("<dc:type>Text</dc:type>"));
    }
}
