const format = require('../lib/format');
const { resolve } = require('sdk/core/promise');

// Test fixtures

const attachment = {
  saveFile: () => null
};

const basicItem = {
  getDisplayTitle: () => "Further Chronicles of Avonlea",
  libraryKey: "XYZ",
  getCreators: () => [{
    lastName: "Montgomery",
    firstName: "Lucy Maud",
    creatorType: "author"
  }],
  getBestAttachment: resolve(attachment)
};

const fullItem = {
  getDisplayTitle: () => "The Complete Guide to Metadata",
  libraryKey: "ABC123",
  itemType: "book",
  date: "2024-01-15",
  abstractNote: "A comprehensive guide to metadata standards and best practices.",
  publisher: "Academic Press",
  language: "en",
  rights: "CC BY 4.0",
  getCreators: () => [
    {
      lastName: "Smith",
      firstName: "John",
      creatorType: "author"
    },
    {
      lastName: "Doe",
      firstName: "Jane",
      creatorType: "editor"
    }
  ],
  getTags: () => [
    { tag: "metadata" },
    { tag: "information science" },
    { tag: "standards" }
  ],
  getBestAttachment: resolve(attachment)
};

const itemWithoutFirstName = {
  getDisplayTitle: () => "Single Name Work",
  libraryKey: "SINGLE",
  getCreators: () => [{
    lastName: "Prince",
    creatorType: "author"
  }],
  getBestAttachment: resolve(attachment)
};

// Test suite

exports["test generateMODS with basic item"] = function(assert) {
  const mods = format.generateMODS(basicItem);
  assert.ok(mods.includes('<title>Further Chronicles of Avonlea</title>'), "MODS contains title");
  assert.ok(mods.includes('<namePart>Lucy Maud Montgomery</namePart>'), "MODS contains author name");
  assert.ok(mods.includes('type="personal"'), "MODS has personal name type");
  assert.ok(mods.includes('xmlns="http://www.loc.gov/mods/v3"'), "MODS has correct namespace");
  assert.ok(mods.includes('<roleTerm type="text">author</roleTerm>'), "MODS includes creator role");
};

exports["test generateMODS with full metadata"] = function(assert) {
  const mods = format.generateMODS(fullItem);
  assert.ok(mods.includes('<title>The Complete Guide to Metadata</title>'), "Contains title");
  assert.ok(mods.includes('<namePart>John Smith</namePart>'), "Contains first author");
  assert.ok(mods.includes('<namePart>Jane Doe</namePart>'), "Contains second author");
  assert.ok(mods.includes('<dateIssued>2024-01-15</dateIssued>'), "Contains date");
  assert.ok(mods.includes('<abstract>A comprehensive guide to metadata standards'), "Contains abstract");
  assert.ok(mods.includes('<typeOfResource>book</typeOfResource>'), "Contains item type");
  assert.ok(mods.includes('<roleTerm type="text">editor</roleTerm>'), "Contains editor role");
};

exports["test generateMODS with single name"] = function(assert) {
  const mods = format.generateMODS(itemWithoutFirstName);
  assert.ok(mods.includes('<namePart>Prince</namePart>'), "Handles single name correctly");
  assert.ok(!mods.includes('undefined'), "No undefined values in output");
};

exports["test generateMODS handles null item"] = function(assert) {
  assert.throws(() => {
    format.generateMODS(null);
  }, /Cannot generate MODS/, "Throws error for null item");
};

exports["test generateDC with basic item"] = function(assert) {
  const dc = format.generateDC(basicItem);
  assert.ok(dc.includes('<dc:identifier>XYZ</dc:identifier>'), "DC contains identifier");
  assert.ok(dc.includes('<dc:title>Further Chronicles of Avonlea</dc:title>'), "DC contains title");
  assert.ok(dc.includes('<dc:creator>Lucy Maud Montgomery</dc:creator>'), "DC contains creator");
  assert.ok(dc.includes('xmlns:dc="http://purl.org/dc/elements/1.1/"'), "DC has correct namespace");
};

exports["test generateDC with full metadata"] = function(assert) {
  const dc = format.generateDC(fullItem);
  assert.ok(dc.includes('<dc:identifier>ABC123</dc:identifier>'), "Contains identifier");
  assert.ok(dc.includes('<dc:title>The Complete Guide to Metadata</dc:title>'), "Contains title");
  assert.ok(dc.includes('<dc:creator>John Smith</dc:creator>'), "Contains author as creator");
  assert.ok(dc.includes('<dc:contributor>Jane Doe</dc:contributor>'), "Contains editor as contributor");
  assert.ok(dc.includes('<dc:date>2024-01-15</dc:date>'), "Contains date");
  assert.ok(dc.includes('<dc:description>A comprehensive guide'), "Contains description");
  assert.ok(dc.includes('<dc:type>Text</dc:type>'), "Contains type");
  assert.ok(dc.includes('<dc:publisher>Academic Press</dc:publisher>'), "Contains publisher");
  assert.ok(dc.includes('<dc:language>en</dc:language>'), "Contains language");
  assert.ok(dc.includes('<dc:rights>CC BY 4.0</dc:rights>'), "Contains rights");
  assert.ok(dc.includes('<dc:subject>metadata</dc:subject>'), "Contains first subject");
  assert.ok(dc.includes('<dc:subject>information science</dc:subject>'), "Contains second subject");
  assert.ok(dc.includes('<dc:subject>standards</dc:subject>'), "Contains third subject");
};

exports["test generateDC handles null item"] = function(assert) {
  assert.throws(() => {
    format.generateDC(null);
  }, /Cannot generate Dublin Core/, "Throws error for null item");
};

exports["test generateDC handles single name"] = function(assert) {
  const dc = format.generateDC(itemWithoutFirstName);
  assert.ok(dc.includes('<dc:creator>Prince</dc:creator>'), "Handles single name correctly");
  assert.ok(!dc.includes('undefined'), "No undefined values in output");
};

exports["test MODS XML structure is valid"] = function(assert) {
  const mods = format.generateMODS(basicItem);
  assert.ok(mods.startsWith('<?xml version="1.0" encoding="UTF-8"?>'), "Has XML declaration");
  assert.ok(mods.includes('<mods'), "Has MODS root element");
  assert.ok(mods.endsWith('</mods>'), "Properly closes MODS element");
};

exports["test DC XML structure is valid"] = function(assert) {
  const dc = format.generateDC(basicItem);
  assert.ok(dc.includes('<oai_dc:dc'), "Has DC root element");
  assert.ok(dc.endsWith('</oai_dc:dc>'), "Properly closes DC element");
};

exports["test XML injection protection"] = function(assert) {
  const maliciousItem = {
    getDisplayTitle: () => "Test <script>alert('xss')</script>",
    libraryKey: "SAFE123",
    getCreators: () => [{
      lastName: "O'Brien",
      firstName: "Test&Break"
    }],
    getBestAttachment: resolve(attachment)
  };

  const mods = format.generateMODS(maliciousItem);
  const dc = format.generateDC(maliciousItem);

  // Check that special characters are escaped
  assert.ok(!mods.includes('<script>'), "MODS escapes script tags");
  assert.ok(!dc.includes('<script>'), "DC escapes script tags");
  assert.ok(mods.includes('&lt;') || mods.includes('&amp;'), "MODS has escaped entities");
};

require("sdk/test").run(exports);
