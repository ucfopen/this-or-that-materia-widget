export function getEmbeddedVideoUrl(url: string): string {
  if (url.includes('youtu')) {
    const stringMatch = url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/)
    if (stringMatch != null && stringMatch.length > 1) {
      return url.includes('/embed/') ? url : ('https://www.youtube.com/embed/' + (stringMatch && stringMatch[1]))
    } else {
      // TODO set invalid to show error
    }
  } else if (url.includes('vimeo')) {
    const stringMatch = url.match(/(?:vimeo)\.com.*(?:videos|video|channels|)\/([\d]+)/i)
    if (stringMatch != null && stringMatch.length > 1) {
      return url.includes('player.vimeo.com') ? url : 'https://player.vimeo.com/video/' + (stringMatch && stringMatch[1])
    } else {
      // TODO set invalid to show error
    }
  }
}

export function processQset(qset: ThisOrThatQset, environment: 'creator' | 'player') {
  if (!qset) return
  const getMediaUrl = environment === 'player' ? Materia.Engine.getMediaUrl : Materia.CreatorCore.getMediaUrl

  // Process Qset assets
  qset.items.forEach((item) => {
    if (!item.answers) return
    item.answers.forEach((ans, i) => {
      if (ans.options.asset.type) {
        switch (ans.options.asset.type) {
          case 'image':
          case 'audio':
            ans.options.asset.value = getMediaUrl(ans.options.asset.id)
            break
          case 'video':
            // ans.options.asset.value = $sce.trustAsResourceUrl(ans.options.asset.value)
            break
        }
      } else { // old qsets do not have an asset type
        ans.options.asset.value = getMediaUrl(ans.options.asset.id)
        ans.options.asset.type = 'image'
      }

      // old qsets do not have feedback inside answers
      if (!ans.options.feedback) {
        ans.options.feedback = ''
      }
    })
  })
}
