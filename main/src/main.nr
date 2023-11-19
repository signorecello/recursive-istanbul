use dep::std;

fn main(root : pub Field, index : Field, hash_path : [Field; 2], secret: [Field; 2], proposalId: pub Field, vote: pub Field) -> pub Field {
    let note_commitment = std::hash::pedersen_hash(secret);
    let nullifier = std::hash::pedersen_hash([root, secret[0], secret[1], proposalId]);

    let check_root = std::merkle::compute_merkle_root(note_commitment, index, hash_path);
    assert(root == check_root);

     // Originally contrained the vote to avoid front-running,
     // but including the vote as a public input is sufficient

     // assert(vote <= 1);

    nullifier
}
