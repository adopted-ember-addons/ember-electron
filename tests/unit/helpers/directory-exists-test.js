'use strict'

const path = require('path')
const expect = require('../../helpers/expect')
const directoryExists = require('../../../lib/helpers/directory-exists')

describe('directory-exists', () => {
  it('should find a path that exits', function () {
    expect(directoryExists(__dirname)).to.be.true
  })

  it('should find a path that does not exist', function () {
    expect(directoryExists(path.join(__dirname, 'fakefakefakedir'))).to.be.false
  })
})
