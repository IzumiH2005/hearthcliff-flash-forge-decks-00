
export const LoadingState = () => {
  return (
    <div className="text-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
      <p className="text-lg text-muted-foreground">Chargement des decks...</p>
    </div>
  );
};
