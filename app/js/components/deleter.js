class Deleter {

  constructor(assetList) {
    this.assetList = assetList
    this.targetElement = ''
    this.deleteFilePath = ''
    this.searchElem = document.querySelector('#ccs3-search-filter')

    document.addEventListener('click', this.onDeleteButtonClick.bind(this))
    this.assetList.assets.map(function(item) { return item.Key; }).indexOf(this.deleteFilePath);
  }

  onDeleteButtonClick(e) {
    if(e.target.src && e.target.src.includes('trash')) {
      this.confirmDeletion(e.target)
    }
  }

  confirmDeletion(targetElement) {
    let confirmation = confirm('Are you sure you want to delete this?')

    if(confirmation) {
      this.targetElement = targetElement.parentElement
      this.deleteFilePath = this.getFilePath(targetElement.parentElement.getAttribute('data-delete-path'))
      this.deleteFile()
    }
  }

  getFilePath(path) {
    let pathArray = []
    if(path.includes('.pdf')) {
      pathArray = path.split('/pdf/')
      return `${S3_PDF_PREFIX}/${pathArray[pathArray.length-1]}`
    } else {
      pathArray = path.split(EXT_SETTINGS.outputBaseUrl)
      return `${S3_IMAGES_PREFIX}${pathArray[pathArray.length-1]}`
    }
  }

  deleteFile(imagePath) {
    const promises = []
    let filename = this.deleteFilePath

    promises.push(App.s3Service.delete(filename))
    const assetStatusService = new AssetStatusService()
    Promise.all(promises)
      .then(() => {
        assetStatusService.showSuccess('Delete successful!')
        this.renderAssetList()
      })
      .catch(() => {
        assetStatusService.showError('Oops, something wrong with the delete.')
      })
  }

  renderAssetList() {
    const removeIndex = this.assetList.assets.map(function(item) { return item.Key; }).indexOf(this.deleteFilePath)
    this.assetList.assets.splice(removeIndex, 1)
    const regex = new Search(this.assetList).buildRegex(this.searchElem.value)
    this.assetList.render(this.assetList.assets.filter(asset => {
      return asset.Key.match(regex)
    }))
  }


}




