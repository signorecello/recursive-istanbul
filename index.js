import { BarretenbergBackend } from "@noir-lang/backend_barretenberg";
import { Noir } from "@noir-lang/noir_js";
import circuit from "./main/target/snippets.json" assert { type: "json"}
import recursion from "./recursion/target/recursion.json" assert { type: "json"}
import fs from "fs"

const backend = new BarretenbergBackend(circuit, { threads: 8 });
const noir = new Noir(circuit, backend);

async function main(inputs) {
    const { witness } = await noir.execute(inputs)
    console.log(witness)
    const proof = await backend.generateIntermediateProof(witness);
    console.log(proof)
    const { proofAsFields, vkHash, vkAsFields } = await backend.generateIntermediateProofArtifacts(
        proof,
        4
    );

    const aggregationObject = Array(16).fill(
       '0x0000000000000000000000000000000000000000000000000000000000000000',
    );

    let artifacts = {
        verification_key: vkAsFields,
        proof: proofAsFields,
        public_inputs: [inputs.root, inputs.proposalId, inputs.vote],
        key_hash: vkHash,
        input_aggregation_object: aggregationObject
    };

    const recursiveBackend = new BarretenbergBackend(recursion, { threads: 8 });
    const recursiveNoir = new Noir(recursion, recursiveBackend);

    console.log(artifacts)
    const { witness: recursiveWitness } = await recursiveNoir.execute(artifacts)
    console.log(recursiveWitness)

    const recursiveProof = await recursiveBackend.generateIntermediateProof(recursiveWitness);
    console.log(recursiveProof)
    backend.destroy()
    recursiveBackend.destroy();
}

const inputs = {
    hash_path: [
    "0x2602c38da657e789f986c0a61f9901a486210daad836a200ebcd8b38420e04d6",
    "0x2e3c9acec1fd409f2a5332178a67eb32c241f12c6d8c3cb231e423de9f8e6e84"
    ],
    index: "0",
    proposalId : "0",
    root : "0x15f45039fa067f0e1c6a5abc6c9a6d28e8f79c18aabf5bb06abf053537c228a4",
    secret  : ["1", "10"],
    vote : "1"
}

main(inputs)
