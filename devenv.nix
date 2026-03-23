{pkgs, ...}: {
  languages = {
    typescript.enable = true;

    javascript = {
      enable = true;
      package = pkgs.nodejs; # LTS

      bun = {
        enable = true;
        install.enable = true;
      };
    };
  };

  enterShell = ''
    echo -e

    echo "Using Node.js $(node --version)"
    echo "Using Bun $(bun --version)"
  '';

  dotenv.disableHint = true;
}
