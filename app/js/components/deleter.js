class Deleter {

  constructor(assetList) {
    this.assetList = assetList
    this.targetElement = ''
    this.deleteFilePath = ''

    document.addEventListener('click', this.onDeleteButtonClick.bind(this))
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
        this.assetList.fetchAssets()
      })
      .catch(() => {
        assetStatusService.showError('Oops, something wrong with the delete.')
      })
  }

}
