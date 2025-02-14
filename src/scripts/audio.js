import {Synth} from "tone"

const synth = new Synth().toDestination()

synth.triggerAttackRelease("C4", "8n")
