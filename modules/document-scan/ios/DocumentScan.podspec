Pod::Spec.new do |s|
  s.name           = 'DocumentScan'
  s.version        = '1.0.0'
  s.summary        = 'Barcode detection in scanned document pages'
  s.license        = 'MIT'
  s.author         = 'Stelau'
  s.homepage       = 'https://vds-verify.stelau.com'
  s.platforms      = { :ios => '16.4' }
  s.swift_version  = '5.9'
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.source_files = "**/*.swift"
  s.pod_target_xcconfig = { 'DEFINES_MODULE' => 'YES' }
end
