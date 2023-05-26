module.exports = {
  'Image Upload': function (browser) {
    browser
      .url('http://localhost:8000')
      .waitForElementVisible('body', 1000)
      .waitForElementVisible('input#fileInput', 1000)
      .pause(1000)
      .setValue('input#fileInput', require('path').resolve(__dirname + '/cute-kitten.jpg'))
      .click('#submit')
      .pause(1000)
      .assert.containsText('h4', 'Image Successfully Uploaded')
      .end()
  }
}
