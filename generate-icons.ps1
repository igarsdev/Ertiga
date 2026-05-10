Add-Type -AssemblyName System.Drawing

$base = 'k:\Website\Ertiga'

function Scale {
  param(
    [double]$Value,
    [double]$Scale
  )
  return [int][Math]::Round($Value * $Scale)
}

function Save-Icon {
  param(
    [string]$Path,
    [int]$Size,
    [bool]$Maskable
  )

  $bitmap = New-Object System.Drawing.Bitmap($Size, $Size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

  if ($Maskable) {
    $graphics.Clear([System.Drawing.Color]::Transparent)
  } else {
    $graphics.Clear([System.Drawing.ColorTranslator]::FromHtml('#1E3A8A'))
  }

  $scale = $Size / 512.0
  $offset = if ($Maskable) { Scale 64 $scale } else { 0 }

  $orange = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#F59E0B'))
  $white = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(230, 255, 255, 255))
  $blue = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#1E3A8A'))

  $bodyX = $offset + (Scale 120 $scale)
  $bodyY = $offset + (Scale 200 $scale)
  $bodyW = Scale 272 $scale
  $bodyH = Scale 160 $scale
  $graphics.FillRectangle($orange, $bodyX, $bodyY, $bodyW, $bodyH)

  $roofPoints = @(
    (New-Object System.Drawing.Point -ArgumentList ($offset + (Scale 152 $scale)), ($offset + (Scale 180 $scale))),
    (New-Object System.Drawing.Point -ArgumentList ($offset + (Scale 360 $scale)), ($offset + (Scale 180 $scale))),
    (New-Object System.Drawing.Point -ArgumentList ($offset + (Scale 392 $scale)), ($offset + (Scale 260 $scale))),
    (New-Object System.Drawing.Point -ArgumentList ($offset + (Scale 120 $scale)), ($offset + (Scale 260 $scale)))
  )
  $graphics.FillPolygon($white, $roofPoints)

  $wheelRadius = Scale 24 $scale
  $wheel1X = ($offset + (Scale 144 $scale)) - $wheelRadius
  $wheel1Y = ($offset + (Scale 310 $scale)) - $wheelRadius
  $wheel2X = ($offset + (Scale 368 $scale)) - $wheelRadius
  $wheel2Y = ($offset + (Scale 310 $scale)) - $wheelRadius

  $graphics.FillEllipse($blue, $wheel1X, $wheel1Y, $wheelRadius * 2, $wheelRadius * 2)
  $graphics.FillEllipse($blue, $wheel2X, $wheel2Y, $wheelRadius * 2, $wheelRadius * 2)

  if ($Maskable) {
    $safeBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#1E3A8A'))
    $safeInset = Scale 56 $scale
    $graphics.FillRectangle($safeBrush, $safeInset, $safeInset, $Size - ($safeInset * 2), $Size - ($safeInset * 2))
  }

  $bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  $graphics.Dispose()
  $bitmap.Dispose()
}

Save-Icon -Path (Join-Path $base 'icon-192.png') -Size 192 -Maskable:$false
Save-Icon -Path (Join-Path $base 'icon-512.png') -Size 512 -Maskable:$false
Save-Icon -Path (Join-Path $base 'icon-maskable.png') -Size 512 -Maskable:$true
