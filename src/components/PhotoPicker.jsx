import { useRef } from 'react'
import { Box, Button, IconButton } from '@mui/material'
import Icon from './Icon'

async function fileToDataUrl(file, maxSize = 1000) {
  const dataUrl = await new Promise((res, rej) => {
    const r = new FileReader()
    r.onload = () => res(r.result)
    r.onerror = rej
    r.readAsDataURL(file)
  })
  // Downscale to keep localStorage small
  return new Promise((res) => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      res(canvas.toDataURL('image/jpeg', 0.8))
    }
    img.onerror = () => res(dataUrl)
    img.src = dataUrl
  })
}

export default function PhotoPicker({ value, onChange, label = 'Tomar foto', height = 180 }) {
  const inputRef = useRef(null)

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    onChange(await fileToDataUrl(file))
    e.target.value = ''
  }

  return (
    <Box>
      <input ref={inputRef} type="file" accept="image/*" capture="environment" hidden onChange={handleFile} />
      {value ? (
        <Box sx={{ position: 'relative', borderRadius: 3, overflow: 'hidden', border: '1px solid #dde4e3' }}>
          <img src={value} alt="foto" style={{ width: '100%', height, objectFit: 'cover', display: 'block' }} />
          <IconButton
            onClick={() => onChange('')}
            sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.55)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}
          >
            <Icon name="delete" />
          </IconButton>
        </Box>
      ) : (
        <Button
          variant="outlined"
          fullWidth
          startIcon={<Icon name="photo_camera" />}
          onClick={() => inputRef.current?.click()}
          sx={{ height, borderStyle: 'dashed', borderColor: 'divider', color: 'text.secondary' }}
        >
          {label}
        </Button>
      )}
    </Box>
  )
}
