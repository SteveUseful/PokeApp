Pod::Spec.new do |s|
  s.name = 'RaidwellOCR'
  s.version = '1.0.0'
  s.summary = 'On-device raid screenshot text recognition'
  s.description = 'Reads locally selected images with Apple Vision.'
  s.license = { :type => 'MIT' }
  s.author = 'Raidwell'
  s.homepage = 'https://raidwell.opal-dace-1205.chatgpt.site'
  s.source = { :git => 'https://raidwell.opal-dace-1205.chatgpt.site' }
  s.platforms = { :ios => '16.4' }
  s.swift_version = '5.9'
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.frameworks = 'Vision', 'UIKit', 'ImageIO'
  s.source_files = '**/*.swift'
  s.pod_target_xcconfig = { 'DEFINES_MODULE' => 'YES' }
end
