const { withAppBuildGradle } = require('@expo/config-plugins');

/**
 * Ships every ABI's native libraries in the base APK instead of per-ABI splits.
 *
 * By default an Android App Bundle splits `lib/<abi>/*.so` into one config APK
 * per ABI, and Play installs the one that matches the device profile. PC
 * Android players (BlueStacks, LDPlayer, MEmu, Google Play Games) run on
 * x86_64 but also advertise ARM through a translation layer, and spoof a phone
 * model. Play then hands them the wrong split: we've seen a "OnePlus 8 Pro"
 * install the app as x86_64, receive `split_config.x86.apk`, and have SoLoader
 * look in `arm64-v8a`. None of those agree, so `libc++_shared.so` is missing
 * everywhere and React Native crashes in `MainApplication.onCreate` before any
 * JS runs (`SoLoaderDSONotFoundError`).
 *
 * With the ABI split disabled, every ABI's libraries are in the base APK, so
 * whichever ABI the OS and SoLoader settle on finds its libraries. The cost is
 * a larger download for everyone.
 *
 * This is a config plugin rather than a hand edit to `build.gradle` because
 * `expo prebuild` regenerates the native project; an edit made by hand would
 * be lost.
 */
const BUNDLE_BLOCK = `
    bundle {
        abi {
            enableSplit = false
        }
    }
`;

const withUniversalAbi = (config) =>
  withAppBuildGradle(config, (cfg) => {
    const gradle = cfg.modResults.contents;
    if (gradle.includes('enableSplit = false')) return cfg;

    const androidBlock = /^android\s*\{\s*$/m;
    if (!androidBlock.test(gradle)) {
      throw new Error(
        'with-universal-abi: could not find the `android {` block in app/build.gradle'
      );
    }

    cfg.modResults.contents = gradle.replace(
      androidBlock,
      (match) => `${match}${BUNDLE_BLOCK}`
    );
    return cfg;
  });

module.exports = withUniversalAbi;
