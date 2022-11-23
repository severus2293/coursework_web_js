var soundsManager={
     clips:{},
     context: null,
     gainNode: null,
     loaded: false,

     init: function () {
         this.context = new AudioContext();
         this.gainNode = this.context.createGain ? this.context.createGain() : this.context.createGainNode()
         this.gainNode.connect(this.context.destination)
     },
     load: function (path,callback) {
         if(this.clips[path]){
             callback(this.clips[path]);
             return;
         }
         var clip = {path: path, buffer: null, loaded: false}
         clip.play = function (volume, loop) {
             soundsManager.play(this.path,{looping: loop? loop: false, volume: volume ? volume : 1})
         };
         this.clips[path] = clip;
         var request = new XMLHttpRequest();
         request.open("GET",path,true);
        request.responseType='arraybuffer';
         request.onload = function(){
             soundsManager.context.decodeAudioData(request.response,function (buffer) {
                 clip.buffer = buffer;
                 clip.loaded = true;
                 callback(clip)
             });
         };
         request.send();

     },
     loadArray: function (array) {
         for(var i =0; i < array.length; i++){
             soundsManager.load(array[i], function () {
                 if (array.length === Object.keys(soundsManager.clips).length){
                     for (sd in soundsManager.clips)
                         if(!soundsManager.clips[sd].loaded) return;
                     soundsManager.loaded = true;
                 }
             });
        };
     },
     play: function (path, setting) {
         if(!soundsManager.loaded){
             setTimeout(function () {
                 soundsManager.play(path,setting)
             },1000)
         }
         var looping = false;
         var volume = 1;

        if(setting){
             if(setting.looping)
                 looping = setting.looping
             if(setting.volume)
                 volume = setting.volume
         }

         var sd = this.clips[path]
         if(sd == null)
             return false;

         var sound = soundsManager.context.createBufferSource();
         sound.buffer = sd.buffer;
         sound.connect(soundsManager.gainNode);
         sound.loop = looping;
         soundsManager.gainNode.gain.value = volume;
         sound.start(0);
         return true;

     },
     toggleMute: function () {
         if(this.gainNode.gain.value > 0){
             this.gainNode.gain.value = 0
         }
         else{
             this.gainNode.gain.value = 1
         }
         
     },
     stopAll: function () {
              this.gainNode.disconnect()
         this.gainNode = this.context.createGain ? this.context.createGain() : this.context.createGainNode()
         this.gainNode.connect(this.context.destination)
     }
 };
