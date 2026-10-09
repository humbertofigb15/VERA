const test = require("node:test");
const assert = require("node:assert/strict");

const {
  USER_STATUS,
  isInstitutionalEmail,
  isValidName,
  isValidPassword
} = require("../config/accountRules");

test("institutional email check accepts the configured domain case-insensitively", () => {
  assert.equal(isInstitutionalEmail("person@vera.local"), true);
  assert.equal(isInstitutionalEmail("PERSON@VERA.LOCAL"), true);
  assert.equal(isInstitutionalEmail("person@example.com"), false);
  assert.equal(isInstitutionalEmail(null), false);
});

test("name validation accepts human names and rejects invalid values", () => {
  assert.equal(isValidName("María José"), true);
  assert.equal(isValidName("O'Connor"), true);
  assert.equal(isValidName("###111"), false);
  assert.equal(isValidName("A"), false);
  assert.equal(isValidName("x".repeat(51)), false);
  assert.equal(isValidName(null), false);
});

test("password validation requires uppercase, lowercase, and digits", () => {
  assert.equal(isValidPassword("Vera1234"), true);
  assert.equal(isValidPassword("vera1234"), false);
  assert.equal(isValidPassword("VERA1234"), false);
  assert.equal(isValidPassword("VeraPass"), false);
  assert.equal(isValidPassword("V1a"), false);
});

test("account status values remain stable", () => {
  assert.deepEqual(USER_STATUS, {
    PENDING: "PENDING",
    ACTIVE: "ACTIVE",
    DISABLED: "DISABLED"
  });
});
