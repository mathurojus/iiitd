import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Clashgo } from "../target/types/clashgo";

describe("clashgo", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.Clashgo as Program<Clashgo>;

  it("Is initialized!", async () => {
    const tx = await program.methods.initializePlayer().rpc();
    console.log("Your transaction signature", tx);
  });
});
